/** --------------------------------------------------------------------------------------------------------------------
 * @file license.service.ts
 * @fileOverview licence reads (with the formatted prices) and the admin dashboard's writes.
 *
 * @note No Redis layer here — the licence list is one small table read by one page, so it was
 *       never cached, and there is nothing to invalidate on write.
 */
import { Injectable, NotFoundException } from '@nestjs/common';

import values from '@src/values';

import { CreateLicenseDto } from './dto/createLicense.dto';
import { LicenseEntity } from './domain/entities/license.entity';
import { LicenseNamespace } from './namespace/license.namespace';
import { LicenseRepository } from './domain/repositories/license.repository';
import { UpdateLicenseDto } from './dto/updateLicense.dto';

@Injectable()
export class LicenseService {
  constructor(private readonly licenseRepository: LicenseRepository) {}

  /** Formatted prices are built here so the website and the dashboard cannot disagree on money. */
  private toView(license: LicenseEntity): LicenseNamespace.ILicenseView {
    return {
      ...license,
      priceStr: Number(license.price).toFixed(2),
      installFeeStr: Number(license.installFee).toFixed(2),
    };
  }

  private notFound(): never {
    throw new NotFoundException({
      message: 'License not found',
      statusCode: values.statusCode.ERROR.LICENSE.NOT_FOUND,
    });
  }

  public async findActive(): Promise<Array<LicenseNamespace.ILicenseView>> {
    return (await this.licenseRepository.findActive()).map((license) => this.toView(license));
  }

  public async findAllForAdmin(): Promise<Array<LicenseNamespace.ILicenseView>> {
    const rows = await this.licenseRepository.find({}, { sort: { category: 'ASC', sortOrder: 'ASC' } });
    return rows.map((license) => this.toView(license));
  }

  public async create(dto: CreateLicenseDto): Promise<LicenseNamespace.ILicenseView> {
    return this.toView(await this.licenseRepository.create(dto as LicenseEntity));
  }

  public async update(_id: string, dto: UpdateLicenseDto): Promise<LicenseNamespace.ILicenseView> {
    const existing = await this.licenseRepository.findById(_id);
    if (!existing) this.notFound();

    return this.toView(await this.licenseRepository.findByIdAndUpdate(_id, dto as Partial<LicenseEntity>));
  }

  public async remove(_id: string): Promise<LicenseNamespace.ILicenseView> {
    const removed = await this.licenseRepository.findByIdAndDelete(_id);
    if (!removed) this.notFound();

    return this.toView(removed);
  }
}
