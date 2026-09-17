/** --------------------------------------------------------------------------------------------------------------------
 * @file productContent.service.ts
 * @fileOverview reads a product page's editorial content and resolves its location references.
 */
import { Injectable, NotFoundException } from '@nestjs/common';

import { RedisService } from '@libs/database/src/redis';
import { LocationRepository } from '@src/app/location/domain/repositories/location.repository';
import values from '@src/values';

import { ProductContentEntity } from './domain/entities/productContent.entity';
import { ProductContentNamespace } from './namespace/productContent.namespace';
import { UpdateProductContentDto } from './dto/updateProductContent.dto';
import { ProductContentRepository } from './domain/repositories/productContent.repository';

/** Same reasoning as pricing: editorial copy changes rarely and every product page reads it. */
const CACHE_TTL_SECONDS = 300;
const CACHE_PREFIX = 'productContent';

@Injectable()
export class ProductContentService {
  constructor(
    private readonly productContentRepository: ProductContentRepository,
    private readonly locationRepository: LocationRepository,
    private readonly redisService: RedisService,
  ) {}

  /** ------------------------------------------------------------------------------------------------------------------
   * @description content for one product, with `locationCities` expanded into real location rows.
   *
   * A city with no matching location row is dropped rather than rendered with blank flag and
   * country — a half-empty location chip looks like a bug to a visitor.
   */
  public async findByProduct(product: string): Promise<ProductContentNamespace.IProductContentView> {
    const cacheKey = `${CACHE_PREFIX}:${product}`;

    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch {
      // Redis is a cache, not a dependency.
    }

    const content = await this.productContentRepository.findByProduct(product);

    if (!content) {
      throw new NotFoundException({
        message: `No page content published for "${product}"`,
        statusCode: values.statusCode.ERROR.PRODUCT_CONTENT.NOT_FOUND,
      });
    }

    const known = await this.locationRepository.findActive();
    const { locationCities, ...rest } = content;

    const view: ProductContentNamespace.IProductContentView = {
      ...rest,
      locations: (locationCities || [])
        .map((city) => known.find((location) => location.city === city))
        .filter(Boolean)
        .map((location) => ({
          city: location.city,
          country: location.country,
          flag: location.flag,
        })),
    };

    try {
      await this.redisService.set(cacheKey, JSON.stringify(view), CACHE_TTL_SECONDS);
    } catch {
      // Warming the cache is best-effort.
    }

    return view;
  }

  /** ------------------------------------------------------------------------------------------------------------------
   * @description the stored row as-is — `locationCities` unresolved — which is what the editor needs
   *              to round-trip. Not cached: staff-only, and they want their own edit back at once.
   */
  public async findRawByProduct(product: string): Promise<ProductContentEntity> {
    const content = await this.productContentRepository.findByProduct(product);

    if (!content) {
      throw new NotFoundException({
        message: `No page content published for "${product}"`,
        statusCode: values.statusCode.ERROR.PRODUCT_CONTENT.NOT_FOUND,
      });
    }

    return content;
  }

  public async update(product: string, dto: UpdateProductContentDto): Promise<ProductContentEntity> {
    const existing = await this.findRawByProduct(product);
    const updated = await this.productContentRepository.findByIdAndUpdate(
      existing._id,
      dto as Partial<ProductContentEntity>,
    );
    await this.invalidateCache(product);
    return updated;
  }

  /** ------------------------------------------------------------------------------------------------------------------
   * @description drops cached content for one product. Every admin write path calls this.
   */
  public async invalidateCache(product: string): Promise<void> {
    await this.redisService.del(`${CACHE_PREFIX}:${product}`).catch(() => undefined);
  }

  /** Every product's cache — for location edits, which affect all product pages at once. */
  public async invalidateAll(): Promise<void> {
    const rows = await this.productContentRepository.find({}, { select: ['product'] });
    await Promise.all(rows.map((row) => this.invalidateCache(row.product)));
  }
}
