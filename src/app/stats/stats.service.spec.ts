/** --------------------------------------------------------------------------------------------------------------------
 * @file stats.service.spec.ts
 * @fileOverview the Recent-activity merge: rows from four sources become one list, newest first, capped, with the
 *               event wording and the attention flag following each row's status.
 */
import { InvoiceNamespace } from '@src/app/invoice/namespace/invoice.namespace';
import { TicketNamespace } from '@src/app/ticket/namespace/ticket.namespace';

import { StatsService } from './stats.service';

const at = (hoursAgo: number): Date => new Date(Date.UTC(2026, 8, 21, 12) - hoursAgo * 60 * 60 * 1000);

describe('StatsService.activity', () => {
  const userRepository = { countDocuments: jest.fn(), findWithPagination: jest.fn() };
  const ticketService = { countOpen: jest.fn(), recent: jest.fn() };
  const invoiceService = { revenue: jest.fn(), recent: jest.fn() };
  const serviceService = { countLive: jest.fn(), recent: jest.fn() };
  const service = new StatsService(
    {} as never,
    userRepository as never,
    {} as never,
    {} as never,
    serviceService as never,
    ticketService as never,
    invoiceService as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    ticketService.recent.mockResolvedValue([
      {
        _id: 't1',
        number: 1042,
        status: TicketNamespace.EStatus.OPEN,
        lastActivityAt: at(1),
        customer: { company: 'QuantEdge Capital', fullName: 'Ops' },
        service: { product: 'Trading VPS' },
      },
      { _id: 't2', number: 1030, status: TicketNamespace.EStatus.CLOSED, lastActivityAt: at(48), customer: { fullName: 'Nimbus' } },
    ]);
    invoiceService.recent.mockResolvedValue([
      { _id: 'i1', number: 'INV-3303', status: InvoiceNamespace.EStatus.OVERDUE, updatedAt: at(5), customer: { company: 'Vertex' } },
      { _id: 'i2', number: 'INV-3301', status: InvoiceNamespace.EStatus.PAID, paidAt: at(3), updatedAt: at(2), product: 'VPS Hosting', customer: { company: 'Acme' } },
    ]);
    serviceService.recent.mockResolvedValue([
      { _id: 's1', serviceId: 'WEB-7001', product: 'Web Hosting', createdAt: at(24), customer: { company: 'Orchard Books' } },
    ]);
    userRepository.findWithPagination.mockResolvedValue({ docs: [{ _id: 'u1', company: 'Fenwick Media', createdAt: at(0.5) }] });
  });

  it('merges every source and sorts newest first', async () => {
    const items = await service.activity();

    expect(items.map((item) => item.id)).toEqual(['customer:u1', 'ticket:t1', 'invoice:i2', 'invoice:i1', 'service:s1', 'ticket:t2']);
  });

  it('words the event after the row status and flags what needs attention', async () => {
    const items = await service.activity();
    const byId = Object.fromEntries(items.map((item) => [item.id, item]));

    expect(byId['ticket:t1']).toMatchObject({ event: 'Ticket #1042 opened', product: 'Trading VPS', customer: 'QuantEdge Capital', needsAttention: true });
    expect(byId['ticket:t2']).toMatchObject({ event: 'Ticket #1030 closed', product: null, customer: 'Nimbus', needsAttention: false });
    expect(byId['invoice:i1']).toMatchObject({ event: 'Invoice INV-3303 overdue', needsAttention: true });
    expect(byId['invoice:i2']).toMatchObject({ event: 'Invoice INV-3301 paid', product: 'VPS Hosting', at: at(3), needsAttention: false });
    expect(byId['service:s1']).toMatchObject({ event: 'New service provisioned (WEB-7001)', product: 'Web Hosting' });
    expect(byId['customer:u1']).toMatchObject({ event: 'New customer', product: null, customer: 'Fenwick Media' });
  });

  it('caps the merged list at the limit and asks each source for that many', async () => {
    const items = await service.activity(3);

    expect(items).toHaveLength(3);
    expect(ticketService.recent).toHaveBeenCalledWith(3);
    expect(userRepository.findWithPagination).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ limit: 3 }));
  });
});
