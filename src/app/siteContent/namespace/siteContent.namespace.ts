/** --------------------------------------------------------------------------------------------------------------------
 * @file siteContent.namespace.ts
 * @fileOverview editorial content for the non-product pages plus the shared footer.
 *
 * @description
 *   One row per page, with the page's fields in a jsonb `content` column. This mirrors how the
 *   reference's admin dashboard edits the site — one section per page — and avoids six near-empty
 *   tables that would each need their own controller.
 */
import { AbstractEntity } from '@libs/database/src/postgres';

export namespace SiteContentNamespace {
  export const TABLE_NAME = 'site_content';

  export enum EPage {
    HOME = 'home',
    ABOUT = 'about',
    CONTACT = 'contact',
    SUPPORT = 'support',
    FOOTER = 'footer',
    LEGAL = 'legal',
    /** Site identity edited on Admin → Settings (name, logo, favicon, share image); not a page. */
    SETTINGS = 'settings',
  }

  export interface ISettingsContent {
    siteName: string;
    /** URLs from POST /upload/brand; empty = the bundled asset / none. */
    logo: string;
    favicon: string;
    shareImage: string;
  }

  export interface IFooterLink {
    label: string;
    /** An appRoutes path, or '#' where the reference had no destination. */
    url: string;
  }

  export interface IFooterColumn {
    heading: string;
    links: Array<IFooterLink>;
  }

  export interface IFooterContent {
    tagline: string;
    copyright: string;
    columns: Array<IFooterColumn>;
    social: Array<{ label: string; url: string; icon: string }>;
  }

  export interface ILegalContent {
    termsUpdated: string;
    termsBody: string;
    privacyUpdated: string;
    privacyBody: string;
  }

  export interface ISiteContent extends AbstractEntity {
    page: EPage;
    /** Field set differs per page; see the seed data for each page's shape. */
    content: Record<string, unknown>;
  }
}
