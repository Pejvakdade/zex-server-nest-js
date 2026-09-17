import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { AbstractRepository } from '@libs/database/src/postgres';
import { LicenseEntity } from '../entities/license.entity';

@Injectable()
export class LicenseRepository extends AbstractRepository<LicenseEntity> {
  constructor(
    @InjectRepository(LicenseEntity) repository: Repository<LicenseEntity>,
    @InjectDataSource() dataSource: DataSource,
  ) {
    super(repository, dataSource);
  }

  public async findActive(): Promise<Array<LicenseEntity>> {
    return this.find({ isActive: true }, { sort: { sortOrder: 'ASC' } });
  }
}
