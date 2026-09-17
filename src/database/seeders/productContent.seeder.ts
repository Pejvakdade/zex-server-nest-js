/** --------------------------------------------------------------------------------------------------------------------
 * @file productContent.seeder.ts
 * @fileOverview seeds editorial content for the seven product pages.
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
    if (await this.productContentRepository.countDocuments()) return;

    await this.productContentRepository.insertMany(
      PRODUCT_CONTENT_SEED_DATA as Array<Omit<ProductContentEntity, '_id'>>,
    );

    this.logger.log(`Seeded content for ${PRODUCT_CONTENT_SEED_DATA.length} product pages`);
  }
}
