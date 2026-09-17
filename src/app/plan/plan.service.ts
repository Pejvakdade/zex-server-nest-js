/** --------------------------------------------------------------------------------------------------------------------
 * @file plan.service.ts
 * @fileOverview reads pricing plans and decorates them with their display fields; admin writes
 *               drop the Redis copies so the public pages never serve stale pricing.
 */
import { Injectable, NotFoundException } from '@nestjs/common';

import { RedisService } from '@libs/database/src/redis';
import values from '@src/values';

import { CreatePlanDto } from './dto/createPlan.dto';
import { PlanEntity } from './domain/entities/plan.entity';
import { UpdatePlanDto } from './dto/updatePlan.dto';
import { PlanNamespace } from './namespace/plan.namespace';
import { PlanRepository } from './domain/repositories/plan.repository';

/** Pricing changes rarely and every marketing page hits it, so a short TTL is plenty. */
const CACHE_TTL_SECONDS = 300;
const CACHE_PREFIX = 'plan:list';

@Injectable()
export class PlanService {
  constructor(
    private readonly planRepository: PlanRepository,
    private readonly redisService: RedisService,
  ) {}

  /** ------------------------------------------------------------------------------------------------------------------
   * @description adds the two fields the reference computed in the browser (`priceStr`,
   *              `featureList`) so every client renders a plan identically.
   */
  private toView(plan: PlanEntity): PlanNamespace.IPlanView {
    return {
      ...plan,
      priceStr: Number(plan.price).toFixed(2),
      featureList: PlanNamespace.buildFeatureList(plan.product, plan.specs),
    };
  }

  /** ------------------------------------------------------------------------------------------------------------------
   * @description plans for a product, cached in Redis.
   *
   * A cache miss (or an unreachable Redis) must never fail the request — pricing pages have to render
   * either way, so cache errors are swallowed and the database answers instead.
   */
  public async findForProduct(
    product: PlanNamespace.EPlanProduct,
    location?: string,
  ): Promise<Array<PlanNamespace.IPlanView>> {
    const cacheKey = `${CACHE_PREFIX}:${product}:${location ?? 'all'}`;

    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch {
      // Redis is a cache, not a dependency — fall through to Postgres.
    }

    const plans = (await this.planRepository.findForProduct(product, location)).map((plan) => this.toView(plan));

    try {
      await this.redisService.set(cacheKey, JSON.stringify(plans), CACHE_TTL_SECONDS);
    } catch {
      // Same again: failing to warm the cache is not a failed request.
    }

    return plans;
  }

  /** ------------------------------------------------------------------------------------------------------------------
   * @description every product's plans in one call, for pages that show more than one product.
   */
  public async findAllGrouped(): Promise<Record<string, Array<PlanNamespace.IPlanView>>> {
    const products = Object.values(PlanNamespace.EPlanProduct);
    const grouped: Record<string, Array<PlanNamespace.IPlanView>> = {};

    for (const product of products) {
      grouped[product] = await this.findForProduct(product);
    }

    return grouped;
  }

  /** ------------------------------------------------------------------------------------------------------------------
   * @description the distinct locations a product is actually sold in.
   */
  public async findLocationsForProduct(product: PlanNamespace.EPlanProduct): Promise<Array<string>> {
    return this.planRepository.findLocationsForProduct(product);
  }

  public async findById(_id: string): Promise<PlanNamespace.IPlanView> {
    const plan = await this.planRepository.findById(_id);

    if (!plan) {
      throw new NotFoundException({
        message: 'Plan not found',
        statusCode: values.statusCode.ERROR.PLAN.NOT_FOUND,
      });
    }

    return this.toView(plan);
  }

  /** ------------------------------------------------------------------------------------------------------------------
   * @description every plan, inactive ones included, for the dashboard table. Not cached: only
   *              staff read it, and they expect to see their own edit immediately.
   */
  public async findAllForAdmin(): Promise<Array<PlanNamespace.IPlanView>> {
    const plans = await this.planRepository.find({}, { sort: { product: 'ASC', sortOrder: 'ASC', price: 'ASC' } });
    return plans.map((plan) => this.toView(plan));
  }

  public async create(dto: CreatePlanDto): Promise<PlanNamespace.IPlanView> {
    const created = await this.planRepository.create(dto as PlanEntity);
    await this.invalidateCache();
    return this.toView(created);
  }

  public async update(_id: string, dto: UpdatePlanDto): Promise<PlanNamespace.IPlanView> {
    const existing = await this.planRepository.findById(_id);

    if (!existing) {
      throw new NotFoundException({
        message: 'Plan not found',
        statusCode: values.statusCode.ERROR.PLAN.NOT_FOUND,
      });
    }

    const updated = await this.planRepository.findByIdAndUpdate(_id, dto as Partial<PlanEntity>);
    // `invalidateCache` derives the location list from the table, so a plan that just moved cities
    // would leave its old `product:oldCity` key behind. Drop that one explicitly.
    await this.invalidateCache([existing.location]);
    return this.toView(updated);
  }

  public async remove(_id: string): Promise<PlanNamespace.IPlanView> {
    const removed = await this.planRepository.findByIdAndDelete(_id);

    if (!removed) {
      throw new NotFoundException({
        message: 'Plan not found',
        statusCode: values.statusCode.ERROR.PLAN.NOT_FOUND,
      });
    }

    await this.invalidateCache([removed.location]);
    return this.toView(removed);
  }

  /** ------------------------------------------------------------------------------------------------------------------
   * @description drops every cached plan list. Every admin write path calls this, or edits would
   *              appear on the public pages up to 5 minutes late.
   *
   * @param extraLocations cities that may no longer have any active plan (and so would not be
   *                       found by the query below) but might still have a cached entry.
   */
  public async invalidateCache(extraLocations: Array<string> = []): Promise<void> {
    const products = Object.values(PlanNamespace.EPlanProduct);
    const known = await Promise.all(products.map((product) => this.planRepository.findLocationsForProduct(product)));
    const locations = [...new Set([...known.flat(), ...extraLocations])];

    await Promise.all(
      products.flatMap((product) =>
        ['all', ...locations].map((location) =>
          this.redisService.del(`${CACHE_PREFIX}:${product}:${location}`).catch(() => undefined),
        ),
      ),
    );
  }
}
