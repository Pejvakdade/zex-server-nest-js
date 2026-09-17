import { Column, Entity, Index } from 'typeorm';

import { AbstractEntity } from '@libs/database/src/postgres';
import { SiteContentNamespace } from '@src/app/siteContent/namespace/siteContent.namespace';

@Entity({ name: SiteContentNamespace.TABLE_NAME })
export class SiteContentEntity extends AbstractEntity implements SiteContentNamespace.ISiteContent {
  @Index({ unique: true })
  @Column({ type: 'enum', enum: SiteContentNamespace.EPage })
  page: SiteContentNamespace.EPage;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  content: Record<string, unknown>;
}
