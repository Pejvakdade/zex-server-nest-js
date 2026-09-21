/** --------------------------------------------------------------------------------------------------------------------
 * @file productContent.namespace.ts
 * @fileOverview editorial content for a product page — hero, feature strip, why-choose, FAQ and the
 *               two icon grids. Mirrors ZX_DEFAULT_PRODUCT_CONTENT in site-data.js.
 */
import { AbstractEntity } from '@libs/database/src/postgres';

export namespace ProductContentNamespace {
  export const TABLE_NAME = 'product_content';

  /** An icon is an emoji key; the frontend swaps it for a line-icon SVG where one exists. */
  export interface IIconItem {
    icon: string;
    title: string;
    subtitle: string;
  }

  export interface IIconLabel {
    icon: string;
    label: string;
  }

  export interface IFaqItem {
    question: string;
    answer: string;
  }

  /** A plain checklist line — kept as an object so the admin group editor can manage it like the others. */
  export interface ITextItem {
    label: string;
  }

  export interface IProductContent extends AbstractEntity {
    /**
     * Not PlanNamespace.EPlanProduct: the reference also carries content for "Software Licenses",
     * which has no pricing plans. Kept as a plain unique string so content and pricing can cover
     * different sets of products.
     */
    product: string;

    heroBadge: string;
    heroHeading1: string;
    heroHeadingAccent: string;
    heroSubheading: string;
    /** URL of the hero background banner (from POST /upload/banner); empty = gradient only. */
    heroImage: string;
    /** <title> / meta description of the public page; blank = derived from the hero copy. */
    seoTitle: string;
    seoDescription: string;

    ctaHeading: string;
    ctaSubheading: string;

    featureStrip: Array<IIconItem>;
    whyChoose: Array<IIconItem>;
    faq: Array<IFaqItem>;

    gridOneTitle: string;
    gridOneSubtitle: string;
    gridOne: Array<IIconLabel>;

    gridTwoTitle: string;
    gridTwoSubtitle: string;
    gridTwo: Array<IIconLabel>;

    /**
     * Extras listed on the selected plan's card after its own specs — "Free SSL Certificate",
     * "LiteSpeed Web Server" and so on. The reference hardcoded these per page; here they are
     * content so they can be edited without a deploy.
     */
    includedFeatures: Array<ITextItem>;

    /**
     * Cities this product is marketed in, by name only.
     *
     * The reference repeated each city's flag and country inside every product's content, so the
     * same fact lived in seven places. Here only the city name is stored and the service resolves
     * it against the location table, keeping one source of truth for flag/country.
     */
    locationCities: Array<string>;
  }

  /** What the API returns: location names resolved into full location rows. */
  export interface IProductContentView extends Omit<IProductContent, 'locationCities'> {
    locations: Array<{ city: string; country: string; flag: string }>;
  }
}
