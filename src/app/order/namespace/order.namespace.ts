/** --------------------------------------------------------------------------------------------------------------------
 * @file order.namespace.ts
 * @fileOverview the knobs of self-service ordering: a customer picks a plan and gets a service plus
 *               its first invoice. There is no payment gateway yet, so the switches that a gateway
 *               would eventually drive live here in one place.
 */
import { PlanNamespace } from '@src/app/plan/namespace/plan.namespace';
import { ServiceNamespace } from '@src/app/service/namespace/service.namespace';

export namespace OrderNamespace {
  /**
   * TEMPORARY — no online payment exists yet, so every order is treated as paid the moment it is
   * placed. Flip to `false` (or replace with a gateway callback) once real payments land; the
   * invoice is then created `Pending` and the admin's mark-paid flow takes over.
   */
  export const AUTO_APPROVE_PAYMENT = true;

  /** The first billing term a fresh order buys. */
  export const TERM_DAYS = 30;

  /** Servers "run"; hosting accounts are merely "active" — matches the seeded rows per product. */
  export const LIVE_STATUS_BY_PRODUCT: Record<PlanNamespace.EPlanProduct, ServiceNamespace.EStatus> = {
    [PlanNamespace.EPlanProduct.VPS_HOSTING]: ServiceNamespace.EStatus.RUNNING,
    [PlanNamespace.EPlanProduct.WINDOWS_VPS]: ServiceNamespace.EStatus.RUNNING,
    [PlanNamespace.EPlanProduct.TRADING_VPS]: ServiceNamespace.EStatus.RUNNING,
    [PlanNamespace.EPlanProduct.DEDICATED_SERVERS]: ServiceNamespace.EStatus.RUNNING,
    [PlanNamespace.EPlanProduct.WEB_HOSTING]: ServiceNamespace.EStatus.ACTIVE,
    [PlanNamespace.EPlanProduct.WORDPRESS_HOSTING]: ServiceNamespace.EStatus.ACTIVE,
  };
}
