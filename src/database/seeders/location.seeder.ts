/** --------------------------------------------------------------------------------------------------------------------
 * @file location.seeder.ts
 * @fileOverview seeds the eight datacenter locations on a fresh database. On an already-seeded database it
 *               only backfills coordinates that are still null (older seeds shipped three cities without
 *               them), so re-running never duplicates rows or overwrites copy an admin has edited.
 */
import { Injectable, Logger } from '@nestjs/common';
import { IsNull } from 'typeorm';

import { LocationEntity } from '@src/app/location/domain/entities/location.entity';
import { LocationRepository } from '@src/app/location/domain/repositories/location.repository';
import { LOCATION_SEED_DATA } from './data/location.data';

@Injectable()
export class LocationSeeder {
  private readonly logger = new Logger(LocationSeeder.name);

  constructor(private readonly locationRepository: LocationRepository) {}

  public async seed(): Promise<void> {
    if (await this.locationRepository.countDocuments()) {
      await this.backfillCoordinates();
      return;
    }

    await this.locationRepository.insertMany(LOCATION_SEED_DATA as Array<Omit<LocationEntity, '_id'>>);

    this.logger.log(`Seeded ${LOCATION_SEED_DATA.length} datacenter locations`);
  }

  /** Gives coordinates to seeded cities that still have none. Rows with coordinates are left alone. */
  private async backfillCoordinates(): Promise<void> {
    const missing = await this.locationRepository.find({ latitude: IsNull() });
    if (!missing.length) return;

    let filled = 0;
    for (const row of missing) {
      const seed = LOCATION_SEED_DATA.find((item) => item.city === row.city);
      if (!seed || seed.latitude == null || seed.longitude == null) continue;

      await this.locationRepository.findByIdAndUpdate(row._id, {
        latitude: seed.latitude,
        longitude: seed.longitude,
      });
      filled++;
    }

    if (filled) this.logger.log(`Backfilled coordinates for ${filled} datacenter location(s)`);
  }
}
