/** --------------------------------------------------------------------------------------------------------------------
 * @file productContent.seeder.ts
 * @fileOverview seeds editorial content for the seven product pages. On an already-seeded database it
 *               only fills `includedFeatures` where it is still empty (the field arrived after the
 *               first seed), never touching copy an admin may have edited.
 */
import { Injectable, Logger } from '@nestjs/common';

import { ProductContentEntity } from '@src/app/productContent/domain/entities/productContent.entity';
import { ProductContentRepository } from '@src/app/productContent/domain/repositories/productContent.repository';
import { PRODUCT_CONTENT_SEED_DATA } from './data/productContent.data';

@Injectable()
export class ProductContentSeeder {
  private readonly logger = new Logger(ProductContentSeeder.name);

  constructor(private readonly productContentRepository: ProductContentRepository) {}

  public async seed(): Promise<void> {
    if (await this.productContentRepository.countDocuments()) {
      await this.backfillIncludedFeatures();
      return;
    }

    await this.productContentRepository.insertMany(
      PRODUCT_CONTENT_SEED_DATA as Array<Omit<ProductContentEntity, '_id'>>,
    );

    this.logger.log(`Seeded content for ${PRODUCT_CONTENT_SEED_DATA.length} product pages`);
  }

  /** Seeds the plan-card extras for products that have none yet. */
  private async backfillIncludedFeatures(): Promise<void> {
    const rows = await this.productContentRepository.find();
    let filled = 0;

    for (const row of rows) {
      if (row.includedFeatures?.length) continue;
      const seed = PRODUCT_CONTENT_SEED_DATA.find((item) => item.product === row.product);
      if (!seed?.includedFeatures?.length) continue;

      await this.productContentRepository.findByIdAndUpdate(row._id, {
        includedFeatures: seed.includedFeatures,
      });
      filled++;
    }

    if (filled) this.logger.log(`Backfilled included features for ${filled} product page(s)`);
  }
}
