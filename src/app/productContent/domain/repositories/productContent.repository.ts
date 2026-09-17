import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { AbstractRepository } from '@libs/database/src/postgres';
import { ProductContentEntity } from '../entities/productContent.entity';

@Injectable()
export class ProductContentRepository extends AbstractRepository<ProductContentEntity> {
  constructor(
    @InjectRepository(ProductContentEntity) repository: Repository<ProductContentEntity>,
    @InjectDataSource() dataSource: DataSource,
  ) {
    super(repository, dataSource);
  }

  public async findByProduct(product: string): Promise<ProductContentEntity> {
    return this.repository.findOne({ where: { product } });
  }
}
