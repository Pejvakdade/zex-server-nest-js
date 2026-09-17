import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { AbstractRepository } from '@libs/database/src/postgres';
import { ContactMessageEntity } from '../entities/contactMessage.entity';

@Injectable()
export class ContactMessageRepository extends AbstractRepository<ContactMessageEntity> {
  constructor(
    @InjectRepository(ContactMessageEntity) repository: Repository<ContactMessageEntity>,
    @InjectDataSource() dataSource: DataSource,
  ) {
    super(repository, dataSource);
  }
}
