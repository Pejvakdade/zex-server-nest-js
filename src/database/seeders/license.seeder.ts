import { Injectable, Logger } from '@nestjs/common';

import { LicenseEntity } from '@src/app/license/domain/entities/license.entity';
import { LicenseRepository } from '@src/app/license/domain/repositories/license.repository';
import { LICENSE_SEED_DATA } from './data/license.data';

@Injectable()
export class LicenseSeeder {
  private readonly logger = new Logger(LicenseSeeder.name);

  constructor(private readonly licenseRepository: LicenseRepository) {}

  public async seed(): Promise<void> {
    if (await this.licenseRepository.countDocuments()) return;

    await this.licenseRepository.insertMany(LICENSE_SEED_DATA as Array<Omit<LicenseEntity, '_id'>>);
    this.logger.log(`Seeded ${LICENSE_SEED_DATA.length} software licences`);
  }
}
