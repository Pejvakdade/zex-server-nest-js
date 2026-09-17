/** --------------------------------------------------------------------------------------------------------------------
 * @file license.data.ts
 * @fileOverview the seven software licences, extracted from the reference admin dashboard's
 *               `licenses` array in ../ZexServerAdditionalPages/Admin Dashboard.dc.html.
 *
 * @note Generated from the reference, not typed by hand. The reference stores three separate
 *       feature1/feature2/feature3 fields per licence; those are collapsed into a `features` array
 *       here, since nothing depends on there being exactly three.
 */
import { LicenseNamespace } from '@src/app/license/namespace/license.namespace';

export const LICENSE_SEED_DATA: Array<Partial<LicenseNamespace.ILicense>> = [
  {
    name: 'cPanel Cloud',
    category: 'cPanel',
    description: 'cPanel & WHM licensing for cloud and virtualized servers.',
    features: ['Account limits by tier', 'WHM administration', 'Works on any VPS'],
    price: 15.0,
    installFee: 15.0,
    sortOrder: 0,
  },
  {
    name: 'cPanel Metal',
    category: 'cPanel',
    description: 'cPanel & WHM licensing for bare-metal dedicated servers.',
    features: ['For dedicated hardware', 'Unlimited accounts tier', 'WHM administration'],
    price: 45.0,
    installFee: 15.0,
    sortOrder: 1,
  },
  {
    name: 'Plesk Web Host — VPS Edition',
    category: 'Plesk',
    description: 'Plesk Web Host licence sized for virtual servers.',
    features: ['Unlimited domains', 'Linux & Windows', 'Plesk extensions catalog'],
    price: 10.0,
    installFee: 15.0,
    sortOrder: 2,
  },
  {
    name: 'Plesk Web Host — Dedicated Edition',
    category: 'Plesk',
    description: 'Plesk Web Host licence for dedicated machines.',
    features: ['Unlimited domains', 'Bare-metal licensing', 'Plesk extensions catalog'],
    price: 35.0,
    installFee: 15.0,
    sortOrder: 3,
  },
  {
    name: 'DirectAdmin',
    category: 'DirectAdmin',
    description: 'Lightweight hosting control panel licence.',
    features: ['Unlimited domains', 'Low resource usage', 'Fast provisioning'],
    price: 4.0,
    installFee: 15.0,
    sortOrder: 4,
  },
  {
    name: 'DA Reseller',
    category: 'DirectAdmin',
    description: 'DirectAdmin reseller licensing for hosting providers.',
    features: ['Resell hosting accounts', 'Branded control panel', 'Client account control'],
    price: 29.0,
    installFee: 20.0,
    sortOrder: 5,
  },
  {
    name: 'WHM Reseller',
    category: 'cPanel',
    description: 'Reseller-tier cPanel licensing under your own WHM.',
    features: ['Resell hosting accounts', 'Branded WHM', 'Client account control'],
    price: 25.0,
    installFee: 12.0,
    sortOrder: 6,
  },
];
