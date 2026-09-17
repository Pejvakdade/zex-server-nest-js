/** --------------------------------------------------------------------------------------------------------------------
 * @file invoice.service.spec.ts
 * @fileOverview invoice numbering, the owner-or-staff read, and how paidAt tracks the status.
 */
import { ConflictException, ForbiddenException } from '@nestjs/common';

import { UserNamespace } from '@src/app/user/namespace/user.namespace';

import { InvoiceEntity } from './domain/entities/invoice.entity';
import { InvoiceNamespace } from './namespace/invoice.namespace';
import { InvoiceService } from './invoice.service';

const customer = { _id: 'c1', type: UserNamespace.EUserType.CLIENT };
const stranger = { _id: 'c2', type: UserNamespace.EUserType.CLIENT };
const admin = { _id: 'a1', type: UserNamespace.EUserType.ADMIN };

const invoice = (overrides: Partial<InvoiceEntity> = {}): InvoiceEntity =>
  ({ _id: 'i1', number: 'INV-3301', customerId: 'c1', status: InvoiceNamespace.EStatus.PENDING, ...overrides }) as InvoiceEntity;

describe('InvoiceService', () => {
  const repository = {
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    maxNumber: jest.fn(),
    create: jest.fn(),
  };
  const service = new InvoiceService(repository as never);

  beforeEach(() => {
    jest.clearAllMocks();
    repository.create.mockImplementation(async (data) => data);
    repository.findByIdAndUpdate.mockImplementation(async (_id, patch) => ({ ...invoice(), ...patch }));
  });

  it('assigns INV-<next> when no number is given, starting at FIRST_NUMBER', async () => {
    repository.findOne.mockResolvedValue(null);

    repository.maxNumber.mockResolvedValue(0);
    await expect(service.create({ amount: 10 } as never)).resolves.toMatchObject({
      number: `${InvoiceNamespace.NUMBER_PREFIX}${InvoiceNamespace.FIRST_NUMBER}`,
    });

    repository.maxNumber.mockResolvedValue(3310);
    await expect(service.create({ amount: 10 } as never)).resolves.toMatchObject({ number: 'INV-3311' });
  });

  it('rejects a hand-typed number that is already taken', async () => {
    repository.findOne.mockResolvedValue(invoice({ _id: 'other' }));

    await expect(service.create({ number: 'INV-3301' } as never)).rejects.toBeInstanceOf(ConflictException);
  });

  it('stamps paidAt only when created as Paid', async () => {
    repository.findOne.mockResolvedValue(null);
    repository.maxNumber.mockResolvedValue(0);

    await expect(service.create({ status: InvoiceNamespace.EStatus.PAID } as never)).resolves.toMatchObject({
      paidAt: expect.any(Date),
    });
    await expect(service.create({ status: InvoiceNamespace.EStatus.PENDING } as never)).resolves.toMatchObject({
      paidAt: null,
    });
  });

  it('markPaid sets status + paidAt once, and refuses a second time', async () => {
    repository.findById.mockResolvedValueOnce(invoice());
    await expect(service.markPaid('i1')).resolves.toMatchObject({
      status: InvoiceNamespace.EStatus.PAID,
      paidAt: expect.any(Date),
    });

    repository.findById.mockResolvedValueOnce(invoice({ status: InvoiceNamespace.EStatus.PAID }));
    await expect(service.markPaid('i1')).rejects.toBeInstanceOf(ConflictException);
  });

  it('update clears paidAt when an invoice is moved back off Paid', async () => {
    repository.findById.mockResolvedValue(invoice({ status: InvoiceNamespace.EStatus.PAID, paidAt: new Date() }));

    await service.update('i1', { status: InvoiceNamespace.EStatus.OVERDUE } as never);

    expect(repository.findByIdAndUpdate).toHaveBeenCalledWith('i1', expect.objectContaining({ paidAt: null }));
  });

  it('findOneFor lets the owner and staff read, not another customer', async () => {
    repository.findById.mockResolvedValue(invoice());

    await expect(service.findOneFor(customer, 'i1')).resolves.toMatchObject({ _id: 'i1' });
    await expect(service.findOneFor(admin, 'i1')).resolves.toMatchObject({ _id: 'i1' });
    await expect(service.findOneFor(stranger, 'i1')).rejects.toBeInstanceOf(ForbiddenException);
  });
});
