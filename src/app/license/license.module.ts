import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LicenseSeeder } from '@src/database/seeders/license.seeder';

import { LicenseEntity } from './domain/entities/license.entity';
import { LicenseController } from './license.controller';
import { LicenseService } from './license.service';
import { LicenseRepository } from './domain/repositories/license.repository';

@Module({
  imports: [TypeOrmModule.forFeature([LicenseEntity])],
  controllers: [LicenseController],
  providers: [LicenseRepository, LicenseService, LicenseSeeder],
  exports: [LicenseRepository, LicenseService],
})
export class LicenseModule implements OnModuleInit {
  constructor(private readonly licenseSeeder: LicenseSeeder) {}

  async onModuleInit(): Promise<void> {
    await this.licenseSeeder.seed();
  }
}
