import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PlanModule } from '@src/app/plan/plan.module';
import { UsersModule } from '@src/app/user/user.module';

import { ServiceController } from './service.controller';
import { ServiceEntity } from './domain/entities/service.entity';
import { ServiceRepository } from './domain/repositories/service.repository';
import { ServiceService } from './service.service';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceEntity]), UsersModule, PlanModule],
  controllers: [ServiceController],
  providers: [ServiceRepository, ServiceService],
  exports: [ServiceRepository, ServiceService],
})
export class ServiceModule {}
