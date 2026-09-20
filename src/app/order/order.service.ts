/** --------------------------------------------------------------------------------------------------------------------
 * @file order.service.ts
 * @fileOverview turns "I want this plan" into a provisioned service and its first invoice — the
 *               same two rows an admin would otherwise create by hand.
 */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import type { TActor } from '@src/common/actor';
import { InvoiceNamespace } from '@src/app/invoice/namespace/invoice.namespace';
import { InvoiceService } from '@src/app/invoice/invoice.service';
import { LicenseEntity } from '@src/app/license/domain/entities/license.entity';
import { LicenseRepository } from '@src/app/license/domain/repositories/license.repository';
import { PlanService } from '@src/app/plan/plan.service';
import { ServiceService } from '@src/app/service/service.service';
import values from '@src/values';

import { CreateOrderDto } from './dto/createOrder.dto';
import { OrderNamespace } from './namespace/order.namespace';

/** Prices are numeric(10,2) in Postgres; keep JS sums from producing 24.990000000000002. */
const round = (value: number): number => Math.round(value * 100) / 100;

@Injectable()
export class OrderService {
  constructor(
    private readonly planService: PlanService,
    private readonly serviceService: ServiceService,
    private readonly invoiceService: InvoiceService,
    private readonly licenseRepository: LicenseRepository,
  ) {}

  /** The bundled control panel, if the customer picked one; unknown or retired licences are a 404. */
  private async resolveLicense(licenseId?: string): Promise<LicenseEntity | null> {
    if (!licenseId) return null;

    const license = await this.licenseRepository.findById(licenseId);
    if (!license || !license.isActive) {
      throw new NotFoundException({
        message: 'Licence not found',
        statusCode: values.statusCode.ERROR.ORDER.LICENSE_NOT_FOUND,
      });
    }

    return license;
  }

  public async place(actor: TActor, dto: CreateOrderDto) {
    // 404 with PLAN.NOT_FOUND comes from the plan service itself.
    const plan = await this.planService.findById(dto.planId);

    if (!plan.isActive) {
      throw new BadRequestException({
        message: 'This plan is no longer available',
        statusCode: values.statusCode.ERROR.ORDER.PLAN_INACTIVE,
      });
    }

    const license = await this.resolveLicense(dto.licenseId);
    const installFee = license && dto.installLicense ? license.installFee : 0;

    // A licence rides on the service row: its name in the label and its price in the monthly figure.
    const label = license ? `${plan.name} + ${license.name}` : plan.name;
    const monthlyPrice = round(plan.price + (license?.price ?? 0));
    const firstInvoice = round(monthlyPrice + installFee);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + OrderNamespace.TERM_DAYS * 24 * 60 * 60 * 1000);

    const service = await this.serviceService.create({
      serviceId: await this.serviceService.nextServiceId(plan.product),
      customerId: actor._id,
      planId: plan._id,
      product: plan.product,
      label,
      location: plan.location,
      status: OrderNamespace.LIVE_STATUS_BY_PRODUCT[plan.product],
      cpu: null,
      ram: null,
      disk: null,
      monthlyPrice,
      expiresAt: expiresAt.toISOString(),
    });

    const invoice = await this.invoiceService.create({
      customerId: actor._id,
      serviceId: service._id,
      amount: firstInvoice,
      dueAt: now.toISOString(),
      description: `${label} — first month${installFee ? ' (incl. install)' : ''}`,
      status: OrderNamespace.AUTO_APPROVE_PAYMENT ? InvoiceNamespace.EStatus.PAID : InvoiceNamespace.EStatus.PENDING,
    });

    return { service, invoice };
  }
}
