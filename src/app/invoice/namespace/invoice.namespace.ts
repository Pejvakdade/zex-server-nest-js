/** --------------------------------------------------------------------------------------------------------------------
 * @file invoice.namespace.ts
 * @fileOverview billing rows — the reference's INVOICE_FIELDS (Invoice #, customer, amount, status,
 *               date) with a real due date and a paid timestamp instead of a free-text "date".
 */
import { AbstractEntity } from '@libs/database/src/postgres';
import { UserNamespace } from '@src/app/user/namespace/user.namespace';

export namespace InvoiceNamespace {
  export const TABLE_NAME = 'invoice';

  /** Invoice numbers are INV-<n>; a fresh table starts here so seeded and real numbers never collide. */
  export const NUMBER_PREFIX = 'INV-';
  export const FIRST_NUMBER = 3301;

  export enum EStatus {
    PAID = 'Paid',
    PENDING = 'Pending',
    OVERDUE = 'Overdue',
  }

  export interface IInvoice extends AbstractEntity {
    /** INV-3301 — unique. */
    number: string;
    customerId: string;
    customer?: UserNamespace.IPublicUser;
    /** The service being billed, if any — nullable so deleting a service keeps its billing history. */
    serviceId?: string | null;
    /** Product line billed (a plan product or "Software Licenses"); null when unspecified. */
    product?: string | null;
    amount: number;
    status: EStatus;
    dueAt: Date;
    paidAt?: Date | null;
    description: string;
  }
}
