/** --------------------------------------------------------------------------------------------------------------------
 * @file siteContent.seeder.ts
 * @fileOverview seeds content for the six non-product pages.
 */
import { Injectable, Logger } from '@nestjs/common';

import { SiteContentEntity } from '@src/app/siteContent/domain/entities/siteContent.entity';
import { SiteContentRepository } from '@src/app/siteContent/domain/repositories/siteContent.repository';
import { SITE_CONTENT_SEED_DATA } from './data/siteContent.data';

@Injectable()
export class SiteContentSeeder {
  private readonly logger = new Logger(SiteContentSeeder.name);

  constructor(private readonly siteContentRepository: SiteContentRepository) {}

  public async seed(): Promise<void> {
    if (await this.siteContentRepository.countDocuments()) return;

    await this.siteContentRepository.insertMany(SITE_CONTENT_SEED_DATA as Array<Omit<SiteContentEntity, '_id'>>);

    this.logger.log(`Seeded content for ${SITE_CONTENT_SEED_DATA.length} site pages`);
  }
}
