/** --------------------------------------------------------------------------------------------------------------------
 * @file stats.service.ts
 * @fileOverview computes the public counters.
 *
 * @description
 *   Each metric returns `null` until the feature that owns its data actually exists — the UI renders
 *   null as a placeholder, never as a number. As of phase 6 only `uptime` is still null: there is no
 *   monitoring integration to read it from.
 *
 *   Deliberately NOT returning plausible-looking defaults: a wrong number is worse than no number,
 *   because nobody can tell it is wrong by looking at it.
 */
import { Injectable } from '@nestjs/common';

import { InvoiceService } from '@src/app/invoice/invoice.service';
import { LicenseRepository } from '@src/app/license/domain/repositories/license.repository';
import { LocationRepository } from '@src/app/location/domain/repositories/location.repository';
import { PlanRepository } from '@src/app/plan/domain/repositories/plan.repository';
import { InvoiceNamespace } from '@src/app/invoice/namespace/invoice.namespace';
import { ServiceService } from '@src/app/service/service.service';
import { TicketNamespace } from '@src/app/ticket/namespace/ticket.namespace';
import { TicketService } from '@src/app/ticket/ticket.service';
import { UserNamespace } from '@src/app/user/namespace/user.namespace';
import { UserRepository } from '@src/app/user/domain/repositories/user.repository';
import { StatsNamespace } from './namespace/stats.namespace';

@Injectable()
export class StatsService {
  constructor(
    private readonly locationRepository: LocationRepository,
    private readonly userRepository: UserRepository,
    private readonly planRepository: PlanRepository,
    private readonly licenseRepository: LicenseRepository,
    private readonly serviceService: ServiceService,
    private readonly ticketService: TicketService,
    private readonly invoiceService: InvoiceService,
  ) {}

  public async fleet(): Promise<StatsNamespace.IFleetStats> {
    const [servers, tickets, locations] = await Promise.all([
      this.serviceService.countLive(),
      this.ticketService.countOpen(),
      this.locationRepository.findActive(),
    ]);

    return {
      servers,
      // TODO: no uptime monitoring integration is scoped yet — stays null until one exists.
      uptime: null,
      tickets,
      locations: locations.length,
    };
  }

  /** Dashboard Overview cards. */
  public async overview(): Promise<StatsNamespace.IAdminOverview> {
    const [customers, admins, staff, plans, licenses, locations, activeServices, openTickets, revenue] =
      await Promise.all([
        this.userRepository.countDocuments({ userType: UserNamespace.EUserType.CLIENT }),
        this.userRepository.countDocuments({ userType: UserNamespace.EUserType.ADMIN }),
        this.userRepository.countDocuments({ userType: UserNamespace.EUserType.STAFF }),
        this.planRepository.countDocuments({ isActive: true }),
        this.licenseRepository.countDocuments({ isActive: true }),
        this.locationRepository.countDocuments({ isActive: true }),
        this.serviceService.countLive(),
        this.ticketService.countOpen(),
        this.invoiceService.revenue(),
      ]);

    return {
      customers,
      staff: admins + staff,
      plans,
      licenses,
      locations,
      activeServices,
      openTickets,
      revenue,
    };
  }

  /**
   * Overview's "Recent activity" + the bell: the latest rows from tickets, invoices, services and
   * customer sign-ups, flattened into one list and sorted newest first. Each source contributes up
   * to `limit` rows so a burst in one table cannot hide the others entirely.
   */
  public async activity(limit = 10): Promise<Array<StatsNamespace.IActivityItem>> {
    const customerName = (user?: { company?: string | null; fullName?: string }): string =>
      user?.company || user?.fullName || 'Unknown customer';

    const [tickets, invoices, services, customers] = await Promise.all([
      this.ticketService.recent(limit),
      this.invoiceService.recent(limit),
      this.serviceService.recent(limit),
      this.userRepository.findWithPagination(
        { userType: UserNamespace.EUserType.CLIENT },
        { page: 1, limit, sort: { createdAt: 'DESC' } },
      ),
    ]);

    const items: Array<StatsNamespace.IActivityItem> = [
      ...tickets.map((ticket) => ({
        id: `ticket:${ticket._id}`,
        kind: 'ticket' as const,
        event:
          ticket.status === TicketNamespace.EStatus.CLOSED
            ? `Ticket #${ticket.number} closed`
            : ticket.status === TicketNamespace.EStatus.PENDING
              ? `Ticket #${ticket.number} answered`
              : `Ticket #${ticket.number} opened`,
        product: ticket.service?.product ?? null,
        customer: customerName(ticket.customer),
        at: ticket.lastActivityAt,
        needsAttention: ticket.status === TicketNamespace.EStatus.OPEN,
      })),
      ...invoices.map((invoice) => ({
        id: `invoice:${invoice._id}`,
        kind: 'invoice' as const,
        event:
          invoice.status === InvoiceNamespace.EStatus.PAID
            ? `Invoice ${invoice.number} paid`
            : invoice.status === InvoiceNamespace.EStatus.OVERDUE
              ? `Invoice ${invoice.number} overdue`
              : `Invoice ${invoice.number} issued`,
        product: invoice.product ?? invoice.service?.product ?? null,
        customer: customerName(invoice.customer),
        at: invoice.paidAt ?? invoice.updatedAt,
        needsAttention: invoice.status === InvoiceNamespace.EStatus.OVERDUE,
      })),
      ...services.map((service) => ({
        id: `service:${service._id}`,
        kind: 'service' as const,
        event: `New service provisioned (${service.serviceId})`,
        product: service.product,
        customer: customerName(service.customer),
        at: service.createdAt,
        needsAttention: false,
      })),
      ...customers.docs.map((user) => ({
        id: `customer:${user._id}`,
        kind: 'customer' as const,
        event: 'New customer',
        product: null,
        customer: customerName(user),
        at: user.createdAt,
        needsAttention: false,
      })),
    ];

    return items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, limit);
  }
}
