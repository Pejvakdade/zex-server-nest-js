import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { AbstractRepository } from '@libs/database/src/postgres';
import { TFindWithPaginationResult } from '@libs/database/src/postgres/type/findWithPagination.type';
import { InvoiceNamespace } from '../../namespace/invoice.namespace';
import { InvoiceEntity } from '../entities/invoice.entity';

@Injectable()
export class InvoiceRepository extends AbstractRepository<InvoiceEntity> {
  constructor(
    @InjectRepository(InvoiceEntity) repository: Repository<InvoiceEntity>,
    @InjectDataSource() dataSource: DataSource,
  ) {
    super(repository, dataSource);
  }

  public async findPaginated(
    filter: { status?: InvoiceNamespace.EStatus; customerId?: string; search?: string },
    page: number,
    limit: number,
  ): Promise<TFindWithPaginationResult<InvoiceEntity>> {
    const qb = this.repository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.customer', 'customer')
      .orderBy('invoice.dueAt', 'DESC')
      .addOrderBy('invoice.number', 'DESC');

    if (filter.status) qb.andWhere('invoice.status = :status', { status: filter.status });
    if (filter.customerId) qb.andWhere('invoice.customerId = :customerId', { customerId: filter.customerId });
    if (filter.search) {
      qb.andWhere(
        '(invoice.number ILIKE :search OR invoice.description ILIKE :search OR customer.fullName ILIKE :search OR customer.company ILIKE :search)',
        { search: `%${filter.search}%` },
      );
    }

    const [docs, totalDocs] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { docs, totalDocs, limit, page, totalPages: Math.ceil(totalDocs / limit) };
  }

  /** Revenue = every paid invoice, summed in the database rather than in JS. */
  public async sumPaid(): Promise<number> {
    const row = await this.repository
      .createQueryBuilder('invoice')
      .select('COALESCE(SUM(invoice.amount), 0)', 'total')
      .where('invoice.status = :status', { status: InvoiceNamespace.EStatus.PAID })
      .getRawOne<{ total: string }>();

    return parseFloat(row?.total ?? '0');
  }

  /** Highest numeric suffix in use, so the next invoice number is always one past it. */
  public async maxNumber(): Promise<number> {
    const row = await this.repository
      .createQueryBuilder('invoice')
      .select(`MAX(CAST(SUBSTRING(invoice.number FROM '[0-9]+$') AS INTEGER))`, 'max')
      .getRawOne<{ max: string | null }>();

    return row?.max ? parseInt(row.max, 10) : 0;
  }
}
