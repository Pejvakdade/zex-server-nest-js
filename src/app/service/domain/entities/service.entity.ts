import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '@libs/database/src/postgres';
import { PlanEntity } from '@src/app/plan/domain/entities/plan.entity';
import { PlanNamespace } from '@src/app/plan/namespace/plan.namespace';
import { ServiceNamespace } from '@src/app/service/namespace/service.namespace';
import { UserEntity } from '@src/app/user/domain/entities/user.entity';

/** numeric comes back from pg as a string; see plan.entity.ts for why this transformer exists. */
const numericToNumber = {
  to: (value: number) => value,
  from: (value: string) => (value === null ? null : parseFloat(value)),
};

@Entity({ name: ServiceNamespace.TABLE_NAME })
export class ServiceEntity extends AbstractEntity implements ServiceNamespace.IService {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 40 })
  serviceId: string;

  @Index()
  @Column({ type: 'uuid' })
  customerId: string;

  /** Deleting a customer takes their services with them — a service without an owner means nothing. */
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customerId' })
  customer?: UserEntity;

  @Column({ type: 'uuid', nullable: true })
  planId?: string | null;

  @ManyToOne(() => PlanEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'planId' })
  plan?: PlanEntity;

  @Column({ type: 'enum', enum: PlanNamespace.EPlanProduct })
  product: PlanNamespace.EPlanProduct;

  @Column({ type: 'varchar', length: 120 })
  label: string;

  @Column({ type: 'varchar', length: 80, default: '' })
  location: string;

  @Column({ type: 'enum', enum: ServiceNamespace.EStatus, default: ServiceNamespace.EStatus.RUNNING })
  status: ServiceNamespace.EStatus;

  @Column({ type: 'smallint', nullable: true })
  cpu?: number | null;

  @Column({ type: 'smallint', nullable: true })
  ram?: number | null;

  @Column({ type: 'smallint', nullable: true })
  disk?: number | null;

  @Column({ type: 'date' })
  expiresAt: Date;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0, transformer: numericToNumber })
  monthlyPrice: number;
}
