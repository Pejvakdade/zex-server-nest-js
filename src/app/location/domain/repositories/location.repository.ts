import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { AbstractRepository } from '@libs/database/src/postgres';
import { LocationEntity } from '../entities/location.entity';

@Injectable()
export class LocationRepository extends AbstractRepository<LocationEntity> {
  constructor(
    @InjectRepository(LocationEntity) repository: Repository<LocationEntity>,
    @InjectDataSource() dataSource: DataSource,
  ) {
    super(repository, dataSource);
  }

  /** Active locations in display order — what every public page needs. */
  public async findActive(): Promise<Array<LocationEntity>> {
    return this.find({ isActive: true }, { sort: { sortOrder: 'ASC' } });
  }
}
