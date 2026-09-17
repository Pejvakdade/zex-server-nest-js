import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { AbstractRepository } from '@libs/database/src/postgres';
import { TFindWithPaginationResult } from '@libs/database/src/postgres/type/findWithPagination.type';
import { PlanNamespace } from '@src/app/plan/namespace/plan.namespace';
import { ServiceNamespace } from '../../namespace/service.namespace';
import { ServiceEntity } from '../entities/service.entity';

@Injectable()
export class ServiceRepository extends AbstractRepository<ServiceEntity> {
  constructor(
    @InjectRepository(ServiceEntity) repository: Repository<ServiceEntity>,
    @InjectDataSource() dataSource: DataSource,
  ) {
    super(repository, dataSource);
  }

  /**
   * The admin table. Query builder rather than `findWithPagination` because `search` is an OR across
   * the service id and the customer's name / company, which FindOptionsWhere cannot express.
   */
  public async findPaginated(
    filter: {
      status?: ServiceNamespace.EStatus;
      product?: PlanNamespace.EPlanProduct;
      customerId?: string;
      search?: string;
    },
    page: number,
    limit: number,
  ): Promise<TFindWithPaginationResult<ServiceEntity>> {
    const qb = this.repository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.customer', 'customer')
      .orderBy('service.createdAt', 'DESC');

    if (filter.status) qb.andWhere('service.status = :status', { status: filter.status });
    if (filter.product) qb.andWhere('service.product = :product', { product: filter.product });
    if (filter.customerId) qb.andWhere('service.customerId = :customerId', { customerId: filter.customerId });
    if (filter.search) {
      qb.andWhere(
        '(service.serviceId ILIKE :search OR service.label ILIKE :search OR customer.fullName ILIKE :search OR customer.company ILIKE :search)',
        { search: `%${filter.search}%` },
      );
    }

    const [docs, totalDocs] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { docs, totalDocs, limit, page, totalPages: Math.ceil(totalDocs / limit) };
  }
}
