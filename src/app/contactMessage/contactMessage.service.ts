/** --------------------------------------------------------------------------------------------------------------------
 * @file contactMessage.service.ts
 * @fileOverview the admin inbox over public contact-form submissions.
 */
import { Injectable, NotFoundException } from '@nestjs/common';

import { TFindWithPaginationResult } from '@libs/database/src/postgres/type/findWithPagination.type';
import values from '@src/values';

import { ContactMessageEntity } from './domain/entities/contactMessage.entity';
import { ContactMessageNamespace } from './namespace/contactMessage.namespace';
import { ContactMessageRepository } from './domain/repositories/contactMessage.repository';
import { GetContactMessagesDto } from './dto/getContactMessages.dto';

@Injectable()
export class ContactMessageService {
  constructor(private readonly contactMessageRepository: ContactMessageRepository) {}

  private notFound(): never {
    throw new NotFoundException({
      message: 'Message not found',
      statusCode: values.statusCode.ERROR.CONTACT_MESSAGE.NOT_FOUND,
    });
  }

  /** Newest first — an inbox. */
  public async findPaginated(query: GetContactMessagesDto): Promise<TFindWithPaginationResult<ContactMessageEntity>> {
    return this.contactMessageRepository.findWithPagination(query.status ? { status: query.status } : {}, {
      page: query.page,
      limit: query.limit,
      sort: { createdAt: 'DESC' },
    });
  }

  public async updateStatus(_id: string, status: ContactMessageNamespace.EStatus): Promise<ContactMessageEntity> {
    const existing = await this.contactMessageRepository.findById(_id);
    if (!existing) this.notFound();

    return this.contactMessageRepository.findByIdAndUpdate(_id, { status });
  }

  public async remove(_id: string): Promise<ContactMessageEntity> {
    const removed = await this.contactMessageRepository.findByIdAndDelete(_id);
    if (!removed) this.notFound();

    return removed;
  }

  /** Unread count, for the dashboard's overview card. */
  public async countNew(): Promise<number> {
    return this.contactMessageRepository.countDocuments({ status: ContactMessageNamespace.EStatus.NEW });
  }
}
