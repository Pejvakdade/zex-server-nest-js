import { Column, Entity, Index } from 'typeorm';

import { AbstractEntity } from '@libs/database/src/postgres';
import { LocationNamespace } from '@src/app/location/namespace/location.namespace';

@Entity({ name: LocationNamespace.TABLE_NAME })
export class LocationEntity extends AbstractEntity implements LocationNamespace.ILocation {
  /** City is how plans reference a location throughout the reference data, so it must be unique. */
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 80 })
  city: string;

  @Column({ type: 'varchar', length: 80 })
  country: string;

  @Column({ type: 'varchar', length: 16 })
  flag: string;

  @Column({ type: 'varchar', length: 120 })
  datacenter: string;

  @Column({ type: 'varchar', length: 80 })
  network: string;

  @Column({ type: 'varchar', length: 80 })
  latencyLabel: string;

  @Column({ type: 'varchar', length: 40 })
  latencyValue: string;

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  products: Array<string>;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'double precision', nullable: true })
  latitude: number | null;

  @Column({ type: 'double precision', nullable: true })
  longitude: number | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;
}
