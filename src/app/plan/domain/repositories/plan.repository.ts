import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { AbstractRepository } from '@libs/database/src/postgres';
import { PlanNamespace } from '@src/app/plan/namespace/plan.namespace';
import { PlanEntity } from '../entities/plan.entity';

@Injectable()
export class PlanRepository extends AbstractRepository<PlanEntity> {
  constructor(
    @InjectRepository(PlanEntity) repository: Repository<PlanEntity>,
    @InjectDataSource() dataSource: DataSource,
  ) {
    super(repository, dataSource);
  }

  /** Active plans for a product, optionally narrowed to one location, in display order. */
  public async findForProduct(product: PlanNamespace.EPlanProduct, location?: string): Promise<Array<PlanEntity>> {
    return this.find(
      { product, isActive: true, ...(location ? { location } : {}) },
      { sort: { sortOrder: 'ASC', price: 'ASC' } },
    );
  }

  /** The distinct locations a product is actually offered in — drives the location switcher. */
  public async findLocationsForProduct(product: PlanNamespace.EPlanProduct): Promise<Array<string>> {
    const rows = await this.repository
      .createQueryBuilder('plan')
      .select('DISTINCT plan.location', 'location')
      .where('plan.product = :product', { product })
      .andWhere('plan.isActive = true')
      .getRawMany<{ location: string }>();

    return rows.map((row) => row.location);
  }
}
