import { Column, Entity, Index } from 'typeorm';

import { AbstractEntity } from '@libs/database/src/postgres';
import { PlanNamespace } from '@src/app/plan/namespace/plan.namespace';

@Entity({ name: PlanNamespace.TABLE_NAME })
/** Every public page filters by product then location, so index the pair. */
@Index(['product', 'location'])
export class PlanEntity extends AbstractEntity implements PlanNamespace.IPlan {
  @Column({ type: 'enum', enum: PlanNamespace.EPlanProduct })
  product: PlanNamespace.EPlanProduct;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'varchar', length: 200, default: '' })
  tagline: string;

  /**
   * `numeric` keeps money exact; the transformer converts it back to a number, because the pg driver
   * returns numeric as a string and an untransformed price would silently concatenate in the UI.
   */
  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value === null ? null : parseFloat(value)),
    },
  })
  price: number;

  @Column({ type: 'boolean', default: false })
  popular: boolean;

  @Column({ type: 'varchar', length: 80 })
  location: string;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  specs: PlanNamespace.IPlanSpecs;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;
}
