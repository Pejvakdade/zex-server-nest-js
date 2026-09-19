/** --------------------------------------------------------------------------------------------------------------------
 * @file stats.namespace.ts
 * @fileOverview types for the public marketing/dashboard counters.
 *
 * @description
 *   Every metric is `number | null`. **null means "this metric has no source of truth yet"** — it is
 *   never a stand-in for zero, and the frontend must render it as a placeholder rather than as a
 *   number. This exists because the reference design ships hardcoded sample figures (42 servers,
 *   99.9% uptime, 3 tickets); a fake number is indistinguishable from a real one once it is on
 *   screen, so we show nothing until the number is genuinely computed.
 */
export namespace StatsNamespace {
  export interface IFleetStats {
    /** Services in Running / Active status. Source: the `service` table (phase 6). */
    servers: number | null;
    /** Rolling network uptime percentage. Source: monitoring integration (not yet scoped). */
    uptime: number | null;
    /** Tickets waiting on staff (status Open). Source: the `ticket` table (phase 6). */
    tickets: number | null;
    /** Datacenter locations offered. Source: the `location` table (phase 3). */
    locations: number | null;
  }

  /** The dashboard's Overview cards. Same null rule: a metric with no table yet stays null. */
  export interface IAdminOverview {
    /** CLIENT accounts. */
    customers: number | null;
    /** ADMIN + STAFF accounts. */
    staff: number | null;
    plans: number | null;
    licenses: number | null;
    locations: number | null;
    /** Services in Running / Active status. Source: the `service` table. */
    activeServices: number | null;
    /** Tickets in status Open. Source: the `ticket` table. */
    openTickets: number | null;
    /** Sum of paid invoices. Source: the `invoice` table. */
    revenue: number | null;
  }
}
