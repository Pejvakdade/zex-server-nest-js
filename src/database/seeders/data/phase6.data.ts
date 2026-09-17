/** --------------------------------------------------------------------------------------------------------------------
 * @file phase6.data.ts
 * @fileOverview demo customers, services, invoices and tickets — the sample rows from
 *               ../ZexServerAdditionalPages/Admin Dashboard.dc.html, keyed by company so the seeder
 *               can resolve the real ids at insert time. Dev only; never loaded in production.
 */
import { InvoiceNamespace } from '@src/app/invoice/namespace/invoice.namespace';
import { PlanNamespace } from '@src/app/plan/namespace/plan.namespace';
import { ServiceNamespace } from '@src/app/service/namespace/service.namespace';
import { TicketNamespace } from '@src/app/ticket/namespace/ticket.namespace';

/** Every demo customer signs in with this. */
export const DEMO_CUSTOMER_PASSWORD = 'Password123!';

export interface IDemoCustomer {
  company: string;
  fullName: string;
  email: string;
}

export const DEMO_CUSTOMERS: Array<IDemoCustomer> = [
  { company: 'Acme Corp', fullName: 'Dana Whitfield', email: 'contact@acmecorp.com' },
  { company: 'Nimbus Labs', fullName: 'Priya Raman', email: 'hello@nimbuslabs.io' },
  { company: 'QuantEdge Capital', fullName: 'Marcus Lee', email: 'ops@quantedgecapital.com' },
  { company: 'Vertex Studios', fullName: 'Elena Costa', email: 'team@vertexstudios.co' },
  { company: 'Marlowe & Co', fullName: 'Jonas Marlowe', email: 'info@marloweandco.com' },
  { company: 'Halcyon Retail', fullName: 'Sofia Nkemelu', email: 'support@halcyonretail.com' },
  { company: 'Bracket Trading', fullName: 'Tom Bracket', email: 'desk@brackettrading.com' },
  { company: 'Fenwick Media', fullName: 'Ava Fenwick', email: 'hello@fenwickmedia.com' },
  { company: 'Orchard Books', fullName: 'Liam Orchard', email: 'contact@orchardbooks.com' },
];

export interface IDemoService {
  serviceId: string;
  company: string;
  product: PlanNamespace.EPlanProduct;
  label: string;
  status: ServiceNamespace.EStatus;
  cpu: number | null;
  ram: number | null;
  disk: number | null;
  location: string;
  expiresAt: string;
  monthlyPrice: number;
}

const P = PlanNamespace.EPlanProduct;
const S = ServiceNamespace.EStatus;

export const DEMO_SERVICES: Array<IDemoService> = [
  {
    serviceId: 'VPS-1042',
    company: 'Acme Corp',
    product: P.VPS_HOSTING,
    label: 'Pro VPS',
    status: S.RUNNING,
    cpu: 22,
    ram: 41,
    disk: 30,
    location: 'New York',
    expiresAt: '2027-01-15',
    monthlyPrice: 24,
  },
  {
    serviceId: 'WVP-2077',
    company: 'Nimbus Labs',
    product: P.WINDOWS_VPS,
    label: 'Windows Pro',
    status: S.RUNNING,
    cpu: 35,
    ram: 52,
    disk: 44,
    location: 'London',
    expiresAt: '2026-11-20',
    monthlyPrice: 32,
  },
  {
    serviceId: 'TVP-3315',
    company: 'QuantEdge Capital',
    product: P.TRADING_VPS,
    label: 'Trader Pro',
    status: S.ISSUE,
    cpu: 96,
    ram: 88,
    disk: 60,
    location: 'Frankfurt',
    expiresAt: '2026-12-05',
    monthlyPrice: 49,
  },
  {
    serviceId: 'DED-4090',
    company: 'Vertex Studios',
    product: P.DEDICATED_SERVERS,
    label: 'Dedicated Pro',
    status: S.RUNNING,
    cpu: 18,
    ram: 33,
    disk: 55,
    location: 'New York',
    expiresAt: '2027-03-10',
    monthlyPrice: 189,
  },
  {
    serviceId: 'WEB-5182',
    company: 'Marlowe & Co',
    product: P.WEB_HOSTING,
    label: 'Business Web',
    status: S.RUNNING,
    cpu: 8,
    ram: 20,
    disk: 12,
    location: 'Amsterdam',
    expiresAt: '2026-09-28',
    monthlyPrice: 9,
  },
  {
    serviceId: 'VPS-1099',
    company: 'Acme Corp',
    product: P.VPS_HOSTING,
    label: 'Starter VPS',
    status: S.SUSPENDED,
    cpu: 0,
    ram: 0,
    disk: 30,
    location: 'New York',
    expiresAt: '2026-08-30',
    monthlyPrice: 12,
  },
  {
    serviceId: 'WVP-2140',
    company: 'Halcyon Retail',
    product: P.WINDOWS_VPS,
    label: 'Windows Business',
    status: S.RUNNING,
    cpu: 41,
    ram: 60,
    disk: 38,
    location: 'London',
    expiresAt: '2027-02-14',
    monthlyPrice: 48,
  },
  {
    serviceId: 'TVP-3390',
    company: 'Bracket Trading',
    product: P.TRADING_VPS,
    label: 'Trader Starter',
    status: S.RUNNING,
    cpu: 30,
    ram: 45,
    disk: 20,
    location: 'Frankfurt',
    expiresAt: '2026-10-22',
    monthlyPrice: 29,
  },
  {
    serviceId: 'DED-4155',
    company: 'Fenwick Media',
    product: P.DEDICATED_SERVERS,
    label: 'Dedicated Enterprise',
    status: S.RUNNING,
    cpu: 25,
    ram: 38,
    disk: 70,
    location: 'Singapore',
    expiresAt: '2027-04-02',
    monthlyPrice: 349,
  },
  {
    serviceId: 'WEB-5220',
    company: 'Orchard Books',
    product: P.WEB_HOSTING,
    label: 'Starter Web',
    status: S.RUNNING,
    cpu: 5,
    ram: 15,
    disk: 9,
    location: 'Amsterdam',
    expiresAt: '2026-12-18',
    monthlyPrice: 5,
  },
];

export interface IDemoInvoice {
  number: string;
  company: string;
  serviceId?: string;
  amount: number;
  status: InvoiceNamespace.EStatus;
  dueAt: string;
  paidAt?: string;
  description: string;
}

const I = InvoiceNamespace.EStatus;

export const DEMO_INVOICES: Array<IDemoInvoice> = [
  {
    number: 'INV-3301',
    company: 'Acme Corp',
    serviceId: 'VPS-1042',
    amount: 340,
    status: I.PAID,
    dueAt: '2026-08-01',
    paidAt: '2026-07-30T10:12:00Z',
    description: 'Pro VPS — annual renewal',
  },
  {
    number: 'INV-3302',
    company: 'QuantEdge Capital',
    serviceId: 'TVP-3315',
    amount: 1240,
    status: I.PAID,
    dueAt: '2026-08-03',
    paidAt: '2026-08-02T09:40:00Z',
    description: 'Trader Pro — annual renewal',
  },
  {
    number: 'INV-3303',
    company: 'Vertex Studios',
    serviceId: 'DED-4090',
    amount: 890,
    status: I.OVERDUE,
    dueAt: '2026-07-28',
    description: 'Dedicated Pro — quarterly',
  },
  {
    number: 'INV-3304',
    company: 'Nimbus Labs',
    serviceId: 'WVP-2077',
    amount: 210,
    status: I.PAID,
    dueAt: '2026-08-05',
    paidAt: '2026-08-05T15:03:00Z',
    description: 'Windows Pro — semi-annual',
  },
  {
    number: 'INV-3305',
    company: 'Halcyon Retail',
    serviceId: 'WVP-2140',
    amount: 155,
    status: I.PENDING,
    dueAt: '2026-09-12',
    description: 'Windows Business — quarterly',
  },
  {
    number: 'INV-3306',
    company: 'Fenwick Media',
    serviceId: 'DED-4155',
    amount: 2150,
    status: I.PAID,
    dueAt: '2026-08-10',
    paidAt: '2026-08-10T11:25:00Z',
    description: 'Dedicated Enterprise — semi-annual',
  },
];

export interface IDemoTicket {
  number: number;
  company: string;
  serviceId?: string;
  subject: string;
  message: string;
  priority: TicketNamespace.EPriority;
  status: TicketNamespace.EStatus;
  /** Hours before "now" the ticket was last active — keeps the demo looking fresh on any day. */
  hoursAgo: number;
  replies: Array<{ from: 'Support' | 'Customer'; text: string; hoursAgo: number }>;
}

const T = TicketNamespace.EStatus;
const PR = TicketNamespace.EPriority;

export const DEMO_TICKETS: Array<IDemoTicket> = [
  {
    number: 1042,
    company: 'QuantEdge Capital',
    serviceId: 'TVP-3315',
    priority: PR.HIGH,
    status: T.OPEN,
    hoursAgo: 2,
    subject: 'TVP-3315 reporting sustained high CPU',
    message:
      'Our Trading VPS (TVP-3315) has been sitting at 90%+ CPU for the last two hours and our MT4 terminal is lagging badly. Can someone take a look?',
    replies: [],
  },
  {
    number: 1041,
    company: 'Vertex Studios',
    serviceId: 'DED-4090',
    priority: PR.MEDIUM,
    status: T.PENDING,
    hoursAgo: 4,
    subject: 'Unable to access WHM control panel',
    message:
      "I'm getting a connection timeout when trying to log into WHM on our Dedicated Server. Regular SSH access still works fine.",
    replies: [
      {
        from: 'Support',
        hoursAgo: 4,
        text: "Thanks for flagging this — we're seeing the same timeout on our end and are restarting the WHM service now. Should be back within 15 minutes.",
      },
    ],
  },
  {
    number: 1038,
    company: 'Acme Corp',
    serviceId: 'VPS-1042',
    priority: PR.LOW,
    status: T.OPEN,
    hoursAgo: 26,
    subject: 'Request to upgrade RAM on VPS-1042',
    message:
      "We'd like to upgrade VPS-1042 from 8GB to 16GB RAM. What's the process and is there any downtime involved?",
    replies: [],
  },
  {
    number: 1035,
    company: 'Halcyon Retail',
    priority: PR.MEDIUM,
    status: T.PENDING,
    hoursAgo: 30,
    subject: 'Invoice discrepancy on August billing',
    message:
      'Our August invoice shows two charges for the same Web Hosting plan. Could you check and issue a credit if this is a duplicate?',
    replies: [
      {
        from: 'Support',
        hoursAgo: 30,
        text: "You're right, that was a billing system duplicate. We've issued a credit to your account and it should reflect within 24 hours.",
      },
    ],
  },
  {
    number: 1030,
    company: 'Nimbus Labs',
    serviceId: 'WVP-2077',
    priority: PR.HIGH,
    status: T.CLOSED,
    hoursAgo: 50,
    subject: 'Reboot loop after Windows update',
    message: 'WVP-2077 has been stuck in a reboot loop since the latest Windows update installed overnight.',
    replies: [
      {
        from: 'Support',
        hoursAgo: 50,
        text: 'We rolled back the update and your server is back online and stable. Let us know if you see any further issues.',
      },
    ],
  },
  {
    number: 1028,
    company: 'Orchard Books',
    serviceId: 'WEB-5220',
    priority: PR.LOW,
    status: T.CLOSED,
    hoursAgo: 74,
    subject: 'SSL certificate renewal',
    message:
      'Our SSL certificate is expiring next week — can this be auto-renewed or do we need to do anything on our end?',
    replies: [
      {
        from: 'Support',
        hoursAgo: 74,
        text: "It's covered under auto-renewal, no action needed on your end. You'll get a confirmation email once it's reissued.",
      },
    ],
  },
];
