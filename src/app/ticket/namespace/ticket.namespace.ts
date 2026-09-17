/** --------------------------------------------------------------------------------------------------------------------
 * @file ticket.namespace.ts
 * @fileOverview support tickets and their reply thread — the reference's TICKET_FIELDS plus the
 *               ticket dialog's `message` / `replies` (Admin Dashboard.dc.html).
 */
import { AbstractEntity } from '@libs/database/src/postgres';
import { UserNamespace } from '@src/app/user/namespace/user.namespace';

export namespace TicketNamespace {
  export const TABLE_NAME = 'ticket';
  export const REPLY_TABLE_NAME = 'ticket_reply';

  /** The reference's first ticket is #1042; numbering starts just below it so seeds and real rows line up. */
  export const FIRST_NUMBER = 1000;

  /**
   * Open    - waiting on staff (new ticket, or the customer replied last)
   * Pending - waiting on the customer (staff replied last)
   * Closed  - resolved; no more replies accepted
   */
  export enum EStatus {
    OPEN = 'Open',
    PENDING = 'Pending',
    CLOSED = 'Closed',
  }

  export enum EPriority {
    HIGH = 'High',
    MEDIUM = 'Medium',
    LOW = 'Low',
  }

  export enum EAuthorType {
    STAFF = 'staff',
    CUSTOMER = 'customer',
  }

  export interface ITicketReply extends AbstractEntity {
    ticketId: string;
    authorId: string;
    authorType: EAuthorType;
    /** Display name snapshot, so a renamed or deleted account keeps the thread readable. */
    authorName: string;
    text: string;
  }

  export interface ITicket extends AbstractEntity {
    /** Sequential; shown as #1042. */
    number: number;
    subject: string;
    message: string;
    customerId: string;
    customer?: UserNamespace.IPublicUser;
    /** The service the ticket is about, if any. */
    serviceId?: string | null;
    priority: EPriority;
    status: EStatus;
    /** Bumped on every reply / status change — the table's "Updated" column. */
    lastActivityAt: Date;
    replies?: Array<ITicketReply>;
  }
}
