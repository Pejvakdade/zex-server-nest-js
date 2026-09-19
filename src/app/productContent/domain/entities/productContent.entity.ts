import { Column, Entity, Index } from 'typeorm';

import { AbstractEntity } from '@libs/database/src/postgres';
import { ProductContentNamespace } from '@src/app/productContent/namespace/productContent.namespace';

@Entity({ name: ProductContentNamespace.TABLE_NAME })
export class ProductContentEntity extends AbstractEntity implements ProductContentNamespace.IProductContent {
  /** One content row per product — every read looks it up by this. */
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 80 })
  product: string;

  @Column({ type: 'varchar', length: 120, default: '' })
  heroBadge: string;

  @Column({ type: 'varchar', length: 160, default: '' })
  heroHeading1: string;

  @Column({ type: 'varchar', length: 160, default: '' })
  heroHeadingAccent: string;

  @Column({ type: 'text', default: '' })
  heroSubheading: string;

  @Column({ type: 'varchar', length: 200, default: '' })
  ctaHeading: string;

  @Column({ type: 'text', default: '' })
  ctaSubheading: string;

  /** The repeating blocks are jsonb: they are read and written whole, never queried into. */
  @Column({ type: 'jsonb', default: () => "'[]'" })
  featureStrip: Array<ProductContentNamespace.IIconItem>;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  whyChoose: Array<ProductContentNamespace.IIconItem>;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  faq: Array<ProductContentNamespace.IFaqItem>;

  @Column({ type: 'varchar', length: 200, default: '' })
  gridOneTitle: string;

  @Column({ type: 'text', default: '' })
  gridOneSubtitle: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  gridOne: Array<ProductContentNamespace.IIconLabel>;

  @Column({ type: 'varchar', length: 200, default: '' })
  gridTwoTitle: string;

  @Column({ type: 'text', default: '' })
  gridTwoSubtitle: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  gridTwo: Array<ProductContentNamespace.IIconLabel>;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  includedFeatures: Array<ProductContentNamespace.ITextItem>;

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  locationCities: Array<string>;
}
