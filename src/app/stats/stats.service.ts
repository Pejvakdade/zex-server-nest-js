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
import { ServiceService } from '@src/app/service/service.service';
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
}
