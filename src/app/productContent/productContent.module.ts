import { Module, OnModuleInit, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LocationModule } from '@src/app/location/location.module';
import { ProductContentSeeder } from '@src/database/seeders/productContent.seeder';

import { ProductContentEntity } from './domain/entities/productContent.entity';
import { ProductContentService } from './productContent.service';
import { ProductContentController } from './productContent.controller';
import { ProductContentRepository } from './domain/repositories/productContent.repository';

@Module({
  /** LocationModule first: content references locations by city and the service joins to them. */
  imports: [TypeOrmModule.forFeature([ProductContentEntity]), forwardRef(() => LocationModule)],
  controllers: [ProductContentController],
  providers: [ProductContentService, ProductContentRepository, ProductContentSeeder],
  exports: [ProductContentService, ProductContentRepository],
})
export class ProductContentModule implements OnModuleInit {
  constructor(private readonly productContentSeeder: ProductContentSeeder) {}

  async onModuleInit(): Promise<void> {
    await this.productContentSeeder.seed();
  }
}
