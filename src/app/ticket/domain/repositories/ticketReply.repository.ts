import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { AbstractRepository } from '@libs/database/src/postgres';
import { TicketReplyEntity } from '../entities/ticketReply.entity';

@Injectable()
export class TicketReplyRepository extends AbstractRepository<TicketReplyEntity> {
  constructor(
    @InjectRepository(TicketReplyEntity) repository: Repository<TicketReplyEntity>,
    @InjectDataSource() dataSource: DataSource,
  ) {
    super(repository, dataSource);
  }
}
