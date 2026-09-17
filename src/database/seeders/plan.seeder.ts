/** --------------------------------------------------------------------------------------------------------------------
 * @file plan.seeder.ts
 * @fileOverview seeds the 27 pricing plans from the reference.
 *
 * @note Plans reference a location by city, so LocationSeeder must have run first. That ordering is
 *       expressed through PlanModule's own `imports:` (it imports LocationModule) rather than through
 *       AppModule's array order — see CLAUDE.md.
 */
import { Injectable, Logger } from '@nestjs/common';

import { PlanEntity } from '@src/app/plan/domain/entities/plan.entity';
import { PlanRepository } from '@src/app/plan/domain/repositories/plan.repository';
import { LocationRepository } from '@src/app/location/domain/repositories/location.repository';
import { PLAN_SEED_DATA } from './data/plan.data';

@Injectable()
export class PlanSeeder {
  private readonly logger = new Logger(PlanSeeder.name);

  constructor(
    private readonly planRepository: PlanRepository,
    private readonly locationRepository: LocationRepository,
  ) {}

  public async seed(): Promise<void> {
    if (await this.planRepository.countDocuments()) return;

    const known = new Set((await this.locationRepository.find()).map((location) => location.city));

    // A plan pointing at a city with no location row would render a broken location switcher, so
    // that is a seed-data bug worth shouting about rather than quietly inserting.
    const orphaned = PLAN_SEED_DATA.filter((plan) => !known.has(plan.location));
    if (orphaned.length) {
      this.logger.error(
        `Skipping ${orphaned.length} plan(s) referencing unknown locations: ` +
          [...new Set(orphaned.map((plan) => plan.location))].join(', '),
      );
    }

    const insertable = PLAN_SEED_DATA.filter((plan) => known.has(plan.location));
    if (!insertable.length) return;

    await this.planRepository.insertMany(insertable as Array<Omit<PlanEntity, '_id'>>);
    this.logger.log(`Seeded ${insertable.length} pricing plans`);
  }
}
