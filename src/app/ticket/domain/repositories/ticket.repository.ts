import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { AbstractRepository } from '@libs/database/src/postgres';
import { TFindWithPaginationResult } from '@libs/database/src/postgres/type/findWithPagination.type';
import { TicketNamespace } from '../../namespace/ticket.namespace';
import { TicketEntity } from '../entities/ticket.entity';

@Injectable()
export class TicketRepository extends AbstractRepository<TicketEntity> {
  constructor(
    @InjectRepository(TicketEntity) repository: Repository<TicketEntity>,
    @InjectDataSource() dataSource: DataSource,
  ) {
    super(repository, dataSource);
  }

  public async findPaginated(
    filter: {
      status?: TicketNamespace.EStatus;
      priority?: TicketNamespace.EPriority;
      customerId?: string;
      search?: string;
    },
    page: number,
    limit: number,
  ): Promise<TFindWithPaginationResult<TicketEntity>> {
    const qb = this.repository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.customer', 'customer')
      .orderBy('ticket.lastActivityAt', 'DESC');

    if (filter.status) qb.andWhere('ticket.status = :status', { status: filter.status });
    if (filter.priority) qb.andWhere('ticket.priority = :priority', { priority: filter.priority });
    if (filter.customerId) qb.andWhere('ticket.customerId = :customerId', { customerId: filter.customerId });
    if (filter.search) {
      qb.andWhere(
        '(ticket.subject ILIKE :search OR CAST(ticket.number AS TEXT) ILIKE :search OR customer.fullName ILIKE :search OR customer.company ILIKE :search)',
        { search: `%${filter.search}%` },
      );
    }

    const [docs, totalDocs] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { docs, totalDocs, limit, page, totalPages: Math.ceil(totalDocs / limit) };
  }

  /** The thread view: the ticket, its customer, and replies oldest first. */
  public async findThread(_id: string): Promise<TicketEntity> {
    return this.repository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.customer', 'customer')
      .leftJoinAndSelect('ticket.replies', 'reply')
      .where('ticket._id = :_id', { _id })
      .orderBy('reply.createdAt', 'ASC')
      .getOne();
  }

  public async maxNumber(): Promise<number> {
    const row = await this.repository
      .createQueryBuilder('ticket')
      .select('MAX(ticket.number)', 'max')
      .getRawOne<{ max: number | null }>();

    return row?.max ? Number(row.max) : 0;
  }
}
