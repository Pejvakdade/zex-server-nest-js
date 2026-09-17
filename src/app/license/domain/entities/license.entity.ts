import { Column, Entity, Index } from 'typeorm';

import { AbstractEntity } from '@libs/database/src/postgres';
import { LicenseNamespace } from '@src/app/license/namespace/license.namespace';

/** Same numeric transformer as PlanEntity: pg returns numeric as a string. */
const money = {
  to: (value: number) => value,
  from: (value: string) => (value === null ? null : parseFloat(value)),
};

@Entity({ name: LicenseNamespace.TABLE_NAME })
@Index(['category'])
export class LicenseEntity extends AbstractEntity implements LicenseNamespace.ILicense {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 140 })
  name: string;

  @Column({ type: 'varchar', length: 80 })
  category: string;

  @Column({ type: 'text', default: '' })
  description: string;

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  features: Array<string>;

  @Column({ type: 'numeric', precision: 10, scale: 2, transformer: money })
  price: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0, transformer: money })
  installFee: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;
}
