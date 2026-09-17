/** --------------------------------------------------------------------------------------------------------------------
 * @file license.namespace.ts
 * @fileOverview software licences sold alongside hosting (cPanel, Plesk, DirectAdmin).
 *
 * @note Deliberately not a Plan: licences carry an installFee and a category, are grouped by vendor
 *       rather than by location, and are not tied to a datacenter. Forcing them into the plan table
 *       would mean a location column that never applies.
 */
import { AbstractEntity } from '@libs/database/src/postgres';

export namespace LicenseNamespace {
  export const TABLE_NAME = 'license';

  export interface ILicense extends AbstractEntity {
    name: string;
    /** Vendor grouping shown as a tab/section on the page: cPanel, Plesk, DirectAdmin. */
    category: string;
    description: string;
    features: Array<string>;
    /** Monthly price. */
    price: number;
    /** One-off setup charge. */
    installFee: number;
    isActive: boolean;
    sortOrder: number;
  }

  export interface ILicenseView extends ILicense {
    priceStr: string;
    installFeeStr: string;
  }
}
