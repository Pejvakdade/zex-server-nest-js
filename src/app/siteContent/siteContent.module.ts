import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SiteContentSeeder } from '@src/database/seeders/siteContent.seeder';

import { SiteContentEntity } from './domain/entities/siteContent.entity';
import { SiteContentService } from './siteContent.service';
import { SiteContentController } from './siteContent.controller';
import { SiteContentRepository } from './domain/repositories/siteContent.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SiteContentEntity])],
  controllers: [SiteContentController],
  providers: [SiteContentService, SiteContentRepository, SiteContentSeeder],
  exports: [SiteContentService, SiteContentRepository],
})
export class SiteContentModule implements OnModuleInit {
  constructor(private readonly siteContentSeeder: SiteContentSeeder) {}

  async onModuleInit(): Promise<void> {
    await this.siteContentSeeder.seed();
  }
}
