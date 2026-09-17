/** --------------------------------------------------------------------------------------------------------------------
 * @file location.seeder.ts
 * @fileOverview seeds the eight datacenter locations. Idempotent — it upserts by city, so re-running
 *               refreshes copy without duplicating rows or disturbing ids.
 */
import { Injectable, Logger } from '@nestjs/common';

import { LocationEntity } from '@src/app/location/domain/entities/location.entity';
import { LocationRepository } from '@src/app/location/domain/repositories/location.repository';
import { LOCATION_SEED_DATA } from './data/location.data';

@Injectable()
export class LocationSeeder {
  private readonly logger = new Logger(LocationSeeder.name);

  constructor(private readonly locationRepository: LocationRepository) {}

  public async seed(): Promise<void> {
    if (await this.locationRepository.countDocuments()) return;

    await this.locationRepository.insertMany(LOCATION_SEED_DATA as Array<Omit<LocationEntity, '_id'>>);

    this.logger.log(`Seeded ${LOCATION_SEED_DATA.length} datacenter locations`);
  }
}
