/** --------------------------------------------------------------------------------------------------------------------
 * @file phase6.seeder.ts
 * @fileOverview dev-only demo data for services, invoices and tickets, so the admin sections and the
 *               customer panel have something to show on a fresh database. Skipped in production
 *               and whenever the service table already has rows.
 */
import * as bcrypt from 'bcryptjs';
import { Injectable, Logger } from '@nestjs/common';

import { InvoiceEntity } from '@src/app/invoice/domain/entities/invoice.entity';
import { InvoiceRepository } from '@src/app/invoice/domain/repositories/invoice.repository';
import { ServiceEntity } from '@src/app/service/domain/entities/service.entity';
import { ServiceRepository } from '@src/app/service/domain/repositories/service.repository';
import { TicketEntity } from '@src/app/ticket/domain/entities/ticket.entity';
import { TicketNamespace } from '@src/app/ticket/namespace/ticket.namespace';
import { TicketReplyEntity } from '@src/app/ticket/domain/entities/ticketReply.entity';
import { TicketReplyRepository } from '@src/app/ticket/domain/repositories/ticketReply.repository';
import { TicketRepository } from '@src/app/ticket/domain/repositories/ticket.repository';
import { UserEntity } from '@src/app/user/domain/entities/user.entity';
import { UserNamespace } from '@src/app/user/namespace/user.namespace';
import { UserRepository } from '@src/app/user/domain/repositories/user.repository';

import { DEMO_CUSTOMERS, DEMO_CUSTOMER_PASSWORD, DEMO_INVOICES, DEMO_SERVICES, DEMO_TICKETS } from './data/phase6.data';

const hoursAgo = (hours: number): Date => new Date(Date.now() - hours * 60 * 60 * 1000);

@Injectable()
export class Phase6Seeder {
  private readonly logger = new Logger(Phase6Seeder.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly serviceRepository: ServiceRepository,
    private readonly invoiceRepository: InvoiceRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly ticketReplyRepository: TicketReplyRepository,
  ) {}

  public async seed(): Promise<void> {
    if (process.env.NODE_ENV === 'production') return;
    if (await this.serviceRepository.countDocuments()) return;

    // 1. Customers — reuse an account if the email already exists (someone may have signed up with it).
    const customerIds = new Map<string, string>();
    const passwordHash = await bcrypt.hash(DEMO_CUSTOMER_PASSWORD, 10);

    for (const demo of DEMO_CUSTOMERS) {
      const existing = await this.userRepository.findByEmail(demo.email);
      const user =
        existing ||
        (await this.userRepository.create({
          fullName: demo.fullName,
          email: demo.email,
          password: passwordHash,
          company: demo.company,
          userType: UserNamespace.EUserType.CLIENT,
          status: UserNamespace.EUserStatus.ACTIVE,
        } as UserEntity));
      customerIds.set(demo.company, user._id);
    }

    // 2. Services
    const serviceIds = new Map<string, string>();
    for (const demo of DEMO_SERVICES) {
      const { company, ...row } = demo;
      const service = await this.serviceRepository.create({
        ...row,
        customerId: customerIds.get(company),
        expiresAt: new Date(row.expiresAt),
      } as unknown as ServiceEntity);
      serviceIds.set(demo.serviceId, service._id);
    }

    // 3. Invoices
    for (const demo of DEMO_INVOICES) {
      const { company, serviceId, ...row } = demo;
      await this.invoiceRepository.create({
        ...row,
        customerId: customerIds.get(company),
        serviceId: serviceId ? serviceIds.get(serviceId) : null,
        dueAt: new Date(row.dueAt),
        paidAt: row.paidAt ? new Date(row.paidAt) : null,
      } as unknown as InvoiceEntity);
    }

    // 4. Tickets and their replies — staff replies are authored by the default admin account.
    const admin = await this.userRepository.findOne({ userType: UserNamespace.EUserType.ADMIN });

    for (const demo of DEMO_TICKETS) {
      const { company, serviceId, replies, hoursAgo: age, ...row } = demo;
      const ticket = await this.ticketRepository.create({
        ...row,
        customerId: customerIds.get(company),
        serviceId: serviceId ? serviceIds.get(serviceId) : null,
        lastActivityAt: hoursAgo(age),
      } as unknown as TicketEntity);

      for (const reply of replies) {
        const staff = reply.from === 'Support';
        await this.ticketReplyRepository.create({
          ticketId: ticket._id,
          authorId: staff ? admin?._id || ticket.customerId : ticket.customerId,
          authorType: staff ? TicketNamespace.EAuthorType.STAFF : TicketNamespace.EAuthorType.CUSTOMER,
          authorName: staff ? 'Support' : DEMO_CUSTOMERS.find((c) => c.company === company)?.fullName || 'Customer',
          text: reply.text,
          createdAt: hoursAgo(reply.hoursAgo),
        } as unknown as TicketReplyEntity);
      }
    }

    this.logger.log(
      `Seeded ${DEMO_CUSTOMERS.length} demo customers, ${DEMO_SERVICES.length} services, ${DEMO_INVOICES.length} invoices, ${DEMO_TICKETS.length} tickets (password: ${DEMO_CUSTOMER_PASSWORD})`,
    );
  }
}
