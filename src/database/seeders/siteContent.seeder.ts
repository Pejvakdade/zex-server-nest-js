/** --------------------------------------------------------------------------------------------------------------------
 * @file siteContent.seeder.ts
 * @fileOverview seeds content for the six non-product pages. On an already-seeded database it only
 *               fills About stats that are still blank (they shipped empty in the first seed).
 */
import { Injectable, Logger } from '@nestjs/common';

import { SiteContentEntity } from '@src/app/siteContent/domain/entities/siteContent.entity';
import { SiteContentNamespace } from '@src/app/siteContent/namespace/siteContent.namespace';
import { SiteContentRepository } from '@src/app/siteContent/domain/repositories/siteContent.repository';
import { SITE_CONTENT_SEED_DATA } from './data/siteContent.data';

@Injectable()
export class SiteContentSeeder {
  private readonly logger = new Logger(SiteContentSeeder.name);

  constructor(private readonly siteContentRepository: SiteContentRepository) {}

  public async seed(): Promise<void> {
    if (await this.siteContentRepository.countDocuments()) {
      await this.backfillAboutStats();
      return;
    }

    await this.siteContentRepository.insertMany(SITE_CONTENT_SEED_DATA as Array<Omit<SiteContentEntity, '_id'>>);

    this.logger.log(`Seeded content for ${SITE_CONTENT_SEED_DATA.length} site pages`);
  }

  /** Fills About stats that are still blank from the seed; a value an admin typed is left alone. */
  private async backfillAboutStats(): Promise<void> {
    const page = SiteContentNamespace.EPage.ABOUT;
    const row = await this.siteContentRepository.findByPage(page);
    const seed = SITE_CONTENT_SEED_DATA.find((item) => item.page === page)?.content as
      | Record<string, string>
      | undefined;
    if (!row || !seed) return;

    const content = { ...(row.content as Record<string, unknown>) };
    let filled = 0;
    for (const key of ['founded', 'serversDeployed', 'uptime']) {
      if (!content[key] && seed[key]) {
        content[key] = seed[key];
        filled++;
      }
    }

    if (!filled) return;
    await this.siteContentRepository.findByIdAndUpdate(row._id, { content });
    this.logger.log(`Backfilled ${filled} About stat(s)`);
  }
}
