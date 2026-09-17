import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { AbstractRepository } from '@libs/database/src/postgres';
import { SiteContentNamespace } from '@src/app/siteContent/namespace/siteContent.namespace';
import { SiteContentEntity } from '../entities/siteContent.entity';

@Injectable()
export class SiteContentRepository extends AbstractRepository<SiteContentEntity> {
  constructor(
    @InjectRepository(SiteContentEntity) repository: Repository<SiteContentEntity>,
    @InjectDataSource() dataSource: DataSource,
  ) {
    super(repository, dataSource);
  }

  public async findByPage(page: SiteContentNamespace.EPage): Promise<SiteContentEntity> {
    return this.repository.findOne({ where: { page } });
  }
}
