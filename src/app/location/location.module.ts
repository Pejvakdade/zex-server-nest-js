import { Module, OnModuleInit, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LocationSeeder } from '@src/database/seeders/location.seeder';
import { PlanModule } from '@src/app/plan/plan.module';
import { ProductContentModule } from '@src/app/productContent/productContent.module';

import { LocationEntity } from './domain/entities/location.entity';
import { LocationController } from './location.controller';
import { LocationRepository } from './domain/repositories/location.repository';
import { LocationService } from './location.service';

@Module({
  /**
   * PlanModule and ProductContentModule both import this module (their seeders need locations
   * first), and this module's admin writes need their services to flush caches — hence forwardRef
   * on both sides of the loop. Seeder order is unaffected: LocationSeeder still runs from this
   * module's own OnModuleInit, which Nest resolves before the importers'.
   */
  imports: [
    TypeOrmModule.forFeature([LocationEntity]),
    forwardRef(() => PlanModule),
    forwardRef(() => ProductContentModule),
  ],
  controllers: [LocationController],
  providers: [LocationRepository, LocationService, LocationSeeder],
  exports: [LocationRepository, LocationService],
})
export class LocationModule implements OnModuleInit {
  constructor(private readonly locationSeeder: LocationSeeder) {}

  async onModuleInit(): Promise<void> {
    await this.locationSeeder.seed();
  }
}
