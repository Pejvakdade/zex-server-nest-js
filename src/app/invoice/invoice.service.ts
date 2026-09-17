/** --------------------------------------------------------------------------------------------------------------------
 * @file invoice.service.ts
 * @fileOverview billing: the admin table, a customer's own invoices, mark-paid, and the revenue sum.
 */
import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { TFindWithPaginationResult } from '@libs/database/src/postgres/type/findWithPagination.type';
import type { TActor } from '@src/common/actor';
import { isStaff } from '@src/common/actor';
import values from '@src/values';

import { CreateInvoiceDto } from './dto/createInvoice.dto';
import { GetInvoicesDto } from './dto/getInvoices.dto';
import { InvoiceEntity } from './domain/entities/invoice.entity';
import { InvoiceNamespace } from './namespace/invoice.namespace';
import { InvoiceRepository } from './domain/repositories/invoice.repository';
import { UpdateInvoiceDto } from './dto/updateInvoice.dto';

@Injectable()
export class InvoiceService {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  private notFound(): never {
    throw new NotFoundException({
      message: 'Invoice not found',
      statusCode: values.statusCode.ERROR.INVOICE.NOT_FOUND,
    });
  }

  private async assertUniqueNumber(number: string, exceptId?: string): Promise<void> {
    const existing = await this.invoiceRepository.findOne({ number });
    if (existing && existing._id !== exceptId) {
      throw new ConflictException({
        message: `Invoice ${number} already exists`,
        statusCode: values.statusCode.ERROR.INVOICE.IS_DUPLICATED,
      });
    }
  }

  public async nextNumber(): Promise<string> {
    const max = await this.invoiceRepository.maxNumber();
    return `${InvoiceNamespace.NUMBER_PREFIX}${Math.max(max + 1, InvoiceNamespace.FIRST_NUMBER)}`;
  }

  public async findPaginated(query: GetInvoicesDto): Promise<TFindWithPaginationResult<InvoiceEntity>> {
    return this.invoiceRepository.findPaginated(
      { status: query.status, customerId: query.customerId, search: query.search },
      query.page,
      query.limit,
    );
  }

  /** The customer panel: own invoices, newest due date first. */
  public async findMine(customerId: string): Promise<Array<InvoiceEntity>> {
    return this.invoiceRepository.find({ customerId }, { sort: { dueAt: 'DESC' } });
  }

  public async findOneFor(actor: TActor, _id: string): Promise<InvoiceEntity> {
    const invoice = await this.invoiceRepository.findById(_id, { populate: ['customer'] });
    if (!invoice) this.notFound();

    if (!isStaff(actor) && invoice.customerId !== actor._id) {
      throw new ForbiddenException({
        message: 'This invoice belongs to another account',
        statusCode: values.statusCode.ERROR.INVOICE.FORBIDDEN_NOT_OWNER,
      });
    }

    return invoice;
  }

  public async create(dto: CreateInvoiceDto): Promise<InvoiceEntity> {
    const number = dto.number || (await this.nextNumber());
    await this.assertUniqueNumber(number);

    const paidAt = dto.status === InvoiceNamespace.EStatus.PAID ? new Date() : null;
    return this.invoiceRepository.create({ ...dto, number, paidAt } as unknown as InvoiceEntity);
  }

  public async update(_id: string, dto: UpdateInvoiceDto): Promise<InvoiceEntity> {
    const existing = await this.invoiceRepository.findById(_id);
    if (!existing) this.notFound();
    if (dto.number) await this.assertUniqueNumber(dto.number, _id);

    // Keep paidAt honest when the status is edited by hand.
    const patch: Partial<InvoiceEntity> = { ...(dto as unknown as Partial<InvoiceEntity>) };
    if (dto.status && dto.status !== existing.status) {
      patch.paidAt = dto.status === InvoiceNamespace.EStatus.PAID ? new Date() : null;
    }

    return this.invoiceRepository.findByIdAndUpdate(_id, patch);
  }

  public async markPaid(_id: string): Promise<InvoiceEntity> {
    const existing = await this.invoiceRepository.findById(_id);
    if (!existing) this.notFound();

    if (existing.status === InvoiceNamespace.EStatus.PAID) {
      throw new ConflictException({
        message: 'Invoice is already paid',
        statusCode: values.statusCode.ERROR.INVOICE.ALREADY_PAID,
      });
    }

    return this.invoiceRepository.findByIdAndUpdate(_id, {
      status: InvoiceNamespace.EStatus.PAID,
      paidAt: new Date(),
    });
  }

  public async remove(_id: string): Promise<InvoiceEntity> {
    const removed = await this.invoiceRepository.findByIdAndDelete(_id);
    if (!removed) this.notFound();

    return removed;
  }

  public async revenue(): Promise<number> {
    return this.invoiceRepository.sumPaid();
  }
}
