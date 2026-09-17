/** --------------------------------------------------------------------------------------------------------------------
 * @file ticket.service.spec.ts
 * @fileOverview the support-desk rules: who may read a thread, how status follows the last reply,
 *               and that closed tickets stay closed until staff reopen them.
 */
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';

import { UserNamespace } from '@src/app/user/namespace/user.namespace';

import { TicketEntity } from './domain/entities/ticket.entity';
import { TicketNamespace } from './namespace/ticket.namespace';
import { TicketService } from './ticket.service';

const customer = { _id: 'c1', type: UserNamespace.EUserType.CLIENT };
const stranger = { _id: 'c2', type: UserNamespace.EUserType.CLIENT };
const staff = { _id: 's1', type: UserNamespace.EUserType.STAFF };

const ticket = (overrides: Partial<TicketEntity> = {}): TicketEntity =>
  ({ _id: 't1', number: 1042, customerId: 'c1', status: TicketNamespace.EStatus.OPEN, ...overrides }) as TicketEntity;

describe('TicketService', () => {
  const tickets = {
    findThread: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    maxNumber: jest.fn(),
    create: jest.fn(),
  };
  const replies = { create: jest.fn() };
  const users = { findById: jest.fn() };
  const service = new TicketService(tickets as never, replies as never, users as never);

  beforeEach(() => {
    jest.clearAllMocks();
    tickets.findThread.mockImplementation(async (_id: string) => ticket({ _id }));
    users.findById.mockResolvedValue({ fullName: 'Ada Lovelace' });
  });

  describe('findThreadFor', () => {
    it('lets the owner and any staff member read it, but not another customer', async () => {
      await expect(service.findThreadFor(customer, 't1')).resolves.toMatchObject({ _id: 't1' });
      await expect(service.findThreadFor(staff, 't1')).resolves.toMatchObject({ _id: 't1' });
      await expect(service.findThreadFor(stranger, 't1')).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('404s before it 403s, so a missing id never leaks ownership', async () => {
      tickets.findThread.mockResolvedValue(null);

      await expect(service.findThreadFor(stranger, 'nope')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('create', () => {
    it('numbers sequentially from the highest existing ticket, never below FIRST_NUMBER', async () => {
      tickets.create.mockImplementation(async (data) => data);

      tickets.maxNumber.mockResolvedValue(1041);
      await expect(service.create(customer, { subject: 'x' } as never)).resolves.toMatchObject({ number: 1042 });

      tickets.maxNumber.mockResolvedValue(0);
      await expect(service.create(customer, { subject: 'x' } as never)).resolves.toMatchObject({
        number: TicketNamespace.FIRST_NUMBER,
      });
    });

    it('lands on the caller unless staff name a customer', async () => {
      tickets.maxNumber.mockResolvedValue(0);
      tickets.create.mockImplementation(async (data) => data);

      await expect(service.create(customer, { customerId: 'c9' } as never)).resolves.toMatchObject({ customerId: 'c1' });
      await expect(service.create(staff, { customerId: 'c9' } as never)).resolves.toMatchObject({ customerId: 'c9' });
      await expect(service.create(staff, {} as never)).resolves.toMatchObject({ customerId: 's1' });
    });
  });

  describe('reply', () => {
    it('a staff reply moves the ticket to Pending and signs as Support', async () => {
      tickets.findById.mockResolvedValue(ticket());

      await service.reply(staff, 't1', 'On it');

      expect(replies.create).toHaveBeenCalledWith(
        expect.objectContaining({ authorType: TicketNamespace.EAuthorType.STAFF, authorName: 'Support', text: 'On it' }),
      );
      expect(tickets.findByIdAndUpdate).toHaveBeenCalledWith(
        't1',
        expect.objectContaining({ status: TicketNamespace.EStatus.PENDING }),
      );
    });

    it('a customer reply reopens it under their own name', async () => {
      tickets.findById.mockResolvedValue(ticket({ status: TicketNamespace.EStatus.PENDING }));

      await service.reply(customer, 't1', 'Still broken');

      expect(replies.create).toHaveBeenCalledWith(
        expect.objectContaining({ authorType: TicketNamespace.EAuthorType.CUSTOMER, authorName: 'Ada Lovelace' }),
      );
      expect(tickets.findByIdAndUpdate).toHaveBeenCalledWith(
        't1',
        expect.objectContaining({ status: TicketNamespace.EStatus.OPEN }),
      );
    });

    it('refuses replies on a closed ticket and from a non-owner', async () => {
      tickets.findById.mockResolvedValue(ticket({ status: TicketNamespace.EStatus.CLOSED }));
      await expect(service.reply(customer, 't1', 'hi')).rejects.toBeInstanceOf(ConflictException);

      tickets.findById.mockResolvedValue(ticket());
      await expect(service.reply(stranger, 't1', 'hi')).rejects.toBeInstanceOf(ForbiddenException);
      expect(replies.create).not.toHaveBeenCalled();
    });
  });
});
