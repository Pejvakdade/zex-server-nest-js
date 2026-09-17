/** --------------------------------------------------------------------------------------------------------------------
 * @file service.namespace.ts
 * @fileOverview a customer's purchased plan instance — the rows behind the reference's SERVICE_FIELDS
 *               (Admin Dashboard.dc.html): a VPS-1042 style id, product, status, usage % and expiry.
 */
import { AbstractEntity } from '@libs/database/src/postgres';
import { PlanNamespace } from '@src/app/plan/namespace/plan.namespace';
import { UserNamespace } from '@src/app/user/namespace/user.namespace';

export namespace ServiceNamespace {
  export const TABLE_NAME = 'service';

  /** Reference options: running / issue / suspended, plus `active` for non-server products (licences). */
  export enum EStatus {
    RUNNING = 'Running',
    ISSUE = 'Issue',
    SUSPENDED = 'Suspended',
    ACTIVE = 'Active',
  }

  /** The statuses that count as "in service" for the fleet / overview counters. */
  export const LIVE_STATUSES: Array<EStatus> = [EStatus.RUNNING, EStatus.ACTIVE];

  export interface IService extends AbstractEntity {
    /** Human id shown everywhere, e.g. VPS-1042 — unique. */
    serviceId: string;
    customerId: string;
    customer?: UserNamespace.IPublicUser;
    /** The plan it was bought from; nullable so deleting a plan does not orphan the row. */
    planId?: string | null;
    product: PlanNamespace.EPlanProduct;
    /** Plan name snapshot at purchase time. */
    label: string;
    /** Datacenter city — matches LocationNamespace.ILocation.city. */
    location: string;
    status: EStatus;
    /** Usage percentages; null for products that have no server (licences, web hosting add-ons). */
    cpu?: number | null;
    ram?: number | null;
    disk?: number | null;
    expiresAt: Date;
    monthlyPrice: number;
  }
}
