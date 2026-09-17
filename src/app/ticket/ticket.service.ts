/** --------------------------------------------------------------------------------------------------------------------
 * @file ticket.service.ts
 * @fileOverview the support desk. Status follows who spoke last: a customer reply (or a new ticket)
 *               puts it in Open, a staff reply moves it to Pending, and Closed is final until staff
 *               reopen it by hand.
 */
import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { TFindWithPaginationResult } from '@libs/database/src/postgres/type/findWithPagination.type';
import type { TActor } from '@src/common/actor';
import { isStaff } from '@src/common/actor';
import { UserRepository } from '@src/app/user/domain/repositories/user.repository';
import values from '@src/values';

import { CreateTicketDto } from './dto/createTicket.dto';
import { GetTicketsDto } from './dto/getTickets.dto';
import { TicketEntity } from './domain/entities/ticket.entity';
import { TicketNamespace } from './namespace/ticket.namespace';
import { TicketReplyEntity } from './domain/entities/ticketReply.entity';
import { TicketReplyRepository } from './domain/repositories/ticketReply.repository';
import { TicketRepository } from './domain/repositories/ticket.repository';
import { UpdateTicketDto } from './dto/updateTicket.dto';

@Injectable()
export class TicketService {
  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly ticketReplyRepository: TicketReplyRepository,
    private readonly userRepository: UserRepository,
  ) {}

  private notFound(): never {
    throw new NotFoundException({
      message: 'Ticket not found',
      statusCode: values.statusCode.ERROR.TICKET.NOT_FOUND,
    });
  }

  private assertOwnerOrStaff(actor: TActor, ticket: TicketEntity): void {
    if (isStaff(actor) || ticket.customerId === actor._id) return;

    throw new ForbiddenException({
      message: 'This ticket belongs to another account',
      statusCode: values.statusCode.ERROR.TICKET.FORBIDDEN_NOT_OWNER,
    });
  }

  public async findPaginated(query: GetTicketsDto): Promise<TFindWithPaginationResult<TicketEntity>> {
    return this.ticketRepository.findPaginated(
      { status: query.status, priority: query.priority, customerId: query.customerId, search: query.search },
      query.page,
      query.limit,
    );
  }

  /** The customer panel: own tickets, most recently active first. */
  public async findMine(customerId: string): Promise<Array<TicketEntity>> {
    return this.ticketRepository.find({ customerId }, { sort: { lastActivityAt: 'DESC' } });
  }

  /** The thread — ticket, customer and replies — for its owner or staff. */
  public async findThreadFor(actor: TActor, _id: string): Promise<TicketEntity> {
    const ticket = await this.ticketRepository.findThread(_id);
    if (!ticket) this.notFound();
    this.assertOwnerOrStaff(actor, ticket);

    return ticket;
  }

  /**
   * A customer opens a ticket on their own account. Staff may open one on a customer's behalf by
   * passing `customerId` (e.g. logging a phone call); without it the ticket lands on their own account.
   */
  public async create(actor: TActor, dto: CreateTicketDto): Promise<TicketEntity> {
    const customerId = isStaff(actor) && dto.customerId ? dto.customerId : actor._id;
    const { customerId: _ignored, ...rest } = dto;

    const number = Math.max((await this.ticketRepository.maxNumber()) + 1, TicketNamespace.FIRST_NUMBER);

    return this.ticketRepository.create({
      ...rest,
      number,
      customerId,
      status: TicketNamespace.EStatus.OPEN,
      lastActivityAt: new Date(),
    } as unknown as TicketEntity);
  }

  public async reply(actor: TActor, _id: string, text: string): Promise<TicketEntity> {
    const ticket = await this.ticketRepository.findById(_id);
    if (!ticket) this.notFound();
    this.assertOwnerOrStaff(actor, ticket);

    if (ticket.status === TicketNamespace.EStatus.CLOSED) {
      throw new ConflictException({
        message: 'This ticket is closed — staff can reopen it',
        statusCode: values.statusCode.ERROR.TICKET.ALREADY_CLOSED,
      });
    }

    const staff = isStaff(actor);
    const author = await this.userRepository.findById(actor._id);

    await this.ticketReplyRepository.create({
      ticketId: _id,
      authorId: actor._id,
      authorType: staff ? TicketNamespace.EAuthorType.STAFF : TicketNamespace.EAuthorType.CUSTOMER,
      authorName: staff ? 'Support' : author?.fullName || 'Customer',
      text,
    } as TicketReplyEntity);

    await this.ticketRepository.findByIdAndUpdate(_id, {
      status: staff ? TicketNamespace.EStatus.PENDING : TicketNamespace.EStatus.OPEN,
      lastActivityAt: new Date(),
    });

    return this.ticketRepository.findThread(_id);
  }

  /** Staff triage — status / priority. */
  public async update(_id: string, dto: UpdateTicketDto): Promise<TicketEntity> {
    const existing = await this.ticketRepository.findById(_id);
    if (!existing) this.notFound();

    await this.ticketRepository.findByIdAndUpdate(_id, { ...dto, lastActivityAt: new Date() });
    return this.ticketRepository.findThread(_id);
  }

  public async remove(_id: string): Promise<TicketEntity> {
    const removed = await this.ticketRepository.findByIdAndDelete(_id);
    if (!removed) this.notFound();

    return removed;
  }

  /** Waiting on staff — the fleet's "tickets" and the overview's "open tickets". */
  public async countOpen(): Promise<number> {
    return this.ticketRepository.countDocuments({ status: TicketNamespace.EStatus.OPEN });
  }
}
