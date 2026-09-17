/** --------------------------------------------------------------------------------------------------------------------
 * @file plan.namespace.ts
 * @fileOverview types for pricing plans, mirroring ZX_DEFAULT_PLANS / ZX_PLAN_FEATURE_FIELDS in
 *               ../ZexServerAdditionalPages/site-data.js.
 */
import { AbstractEntity } from '@libs/database/src/postgres';

export namespace PlanNamespace {
  export const TABLE_NAME = 'plan';

  export enum EPlanProduct {
    VPS_HOSTING = 'VPS Hosting',
    WINDOWS_VPS = 'Windows VPS',
    TRADING_VPS = 'Trading VPS',
    DEDICATED_SERVERS = 'Dedicated Servers',
    WEB_HOSTING = 'Web Hosting',
    WORDPRESS_HOSTING = 'WordPress Hosting',
  }

  /**
   * Product-specific hardware specs. Which keys are present varies per product — a VPS has `ipv4`,
   * a dedicated server has `processor`, web hosting has `addonDomains` — so these live in a single
   * jsonb column rather than as 10 mostly-null columns.
   */
  export interface IPlanSpecs {
    cpu?: string;
    ram?: string;
    storage?: string;
    bandwidth?: string;
    network?: string;
    processor?: string;
    ipv4?: string;
    ip?: string;
    addonDomains?: string;
    sites?: string;
    [key: string]: string | undefined;
  }

  /**
   * How a product's specs become the bullet list on a plan card: which keys, in what order, with
   * what label. Copied from ZX_PLAN_FEATURE_FIELDS. An empty label means the value is already a
   * full phrase ("2 vCPU Cores") and must not have a label appended.
   */
  export interface IFeatureField {
    key: string;
    label: string;
    /** Used instead of `label` when the numeric value is not exactly 1. */
    plural?: string;
  }

  export const FEATURE_FIELDS: Record<EPlanProduct, Array<IFeatureField>> = {
    [EPlanProduct.VPS_HOSTING]: [
      { key: 'cpu', label: '' },
      { key: 'ram', label: 'RAM' },
      { key: 'storage', label: 'NVMe SSD' },
      { key: 'bandwidth', label: 'Bandwidth' },
      { key: 'ipv4', label: 'IPv4 Address', plural: 'IPv4 Addresses' },
    ],
    [EPlanProduct.WINDOWS_VPS]: [
      { key: 'cpu', label: '' },
      { key: 'ram', label: 'RAM' },
      { key: 'storage', label: 'NVMe SSD' },
      { key: 'bandwidth', label: 'Bandwidth' },
    ],
    [EPlanProduct.TRADING_VPS]: [
      { key: 'cpu', label: '' },
      { key: 'ram', label: 'RAM' },
      { key: 'storage', label: 'NVMe SSD' },
      { key: 'network', label: 'Network' },
      { key: 'ip', label: '' },
    ],
    [EPlanProduct.DEDICATED_SERVERS]: [
      { key: 'processor', label: '' },
      { key: 'ram', label: 'RAM' },
      { key: 'storage', label: '' },
      { key: 'bandwidth', label: 'Bandwidth' },
      { key: 'network', label: 'Network' },
      { key: 'ip', label: '' },
    ],
    [EPlanProduct.WEB_HOSTING]: [
      { key: 'storage', label: 'Storage' },
      { key: 'cpu', label: '' },
      { key: 'ram', label: 'RAM' },
      { key: 'addonDomains', label: 'Addon Domain', plural: 'Addon Domains' },
    ],
    [EPlanProduct.WORDPRESS_HOSTING]: [
      { key: 'storage', label: 'Storage' },
      { key: 'cpu', label: '' },
      { key: 'ram', label: 'RAM' },
      { key: 'sites', label: 'Website', plural: 'Websites' },
    ],
  };

  export interface IPlan extends AbstractEntity {
    product: EPlanProduct;
    name: string;
    tagline: string;
    /** Monthly price. `numeric` in Postgres, carried as a JS number through the API. */
    price: number;
    popular: boolean;
    /** The city of the location this plan is offered in — matches LocationNamespace.ILocation.city. */
    location: string;
    specs: IPlanSpecs;
    isActive: boolean;
    sortOrder: number;
  }

  /** What the API returns: the row plus the presentation fields the reference computed client-side. */
  export interface IPlanView extends IPlan {
    priceStr: string;
    featureList: Array<string>;
  }

  /** --------------------------------------------------------------------------------------------------------------------
   * @description turns a plan's specs into its display bullet list.
   *
   * Ported from ZX_getPlans in site-data.js so the website and the admin dashboard cannot drift
   * apart: the reference recomputed this in the browser on every page, which is exactly how two
   * copies of the same rule end up disagreeing.
   */
  export const buildFeatureList = (product: EPlanProduct, specs: IPlanSpecs): Array<string> =>
    (FEATURE_FIELDS[product] || [])
      .filter((field) => specs?.[field.key])
      .map((field) => {
        const value = specs[field.key];
        const count = parseFloat(value);
        const label = field.plural && count !== 1 ? field.plural : field.label;
        return label ? `${value} ${label}` : value;
      });
}
