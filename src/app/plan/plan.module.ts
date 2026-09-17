import { Module, OnModuleInit, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PlanSeeder } from '@src/database/seeders/plan.seeder';
import { LocationModule } from '@src/app/location/location.module';

import { PlanEntity } from './domain/entities/plan.entity';
import { PlanService } from './plan.service';
import { PlanController } from './plan.controller';
import { PlanRepository } from './domain/repositories/plan.repository';

@Module({
  /**
   * LocationModule is imported so its OnModuleInit (and therefore LocationSeeder) runs before this
   * module's — plans reference locations by city. This is the single-parent dependency chain the
   * Miveh convention says to express through `imports:`; see CLAUDE.md.
   */
  imports: [TypeOrmModule.forFeature([PlanEntity]), forwardRef(() => LocationModule)],
  controllers: [PlanController],
  providers: [PlanService, PlanRepository, PlanSeeder],
  exports: [PlanService, PlanRepository],
})
export class PlanModule implements OnModuleInit {
  constructor(private readonly planSeeder: PlanSeeder) {}

  async onModuleInit(): Promise<void> {
    await this.planSeeder.seed();
  }
}
