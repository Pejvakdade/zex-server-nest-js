import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '@libs/database/src/postgres';
import { InvoiceNamespace } from '@src/app/invoice/namespace/invoice.namespace';
import { ServiceEntity } from '@src/app/service/domain/entities/service.entity';
import { UserEntity } from '@src/app/user/domain/entities/user.entity';

const numericToNumber = {
  to: (value: number) => value,
  from: (value: string) => (value === null ? null : parseFloat(value)),
};

@Entity({ name: InvoiceNamespace.TABLE_NAME })
export class InvoiceEntity extends AbstractEntity implements InvoiceNamespace.IInvoice {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 40 })
  number: string;

  @Index()
  @Column({ type: 'uuid' })
  customerId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customerId' })
  customer?: UserEntity;

  @Column({ type: 'uuid', nullable: true })
  serviceId?: string | null;

  @ManyToOne(() => ServiceEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'serviceId' })
  service?: ServiceEntity;

  @Column({ type: 'numeric', precision: 10, scale: 2, transformer: numericToNumber })
  amount: number;

  @Column({ type: 'enum', enum: InvoiceNamespace.EStatus, default: InvoiceNamespace.EStatus.PENDING })
  status: InvoiceNamespace.EStatus;

  @Column({ type: 'date' })
  dueAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  paidAt?: Date | null;

  @Column({ type: 'varchar', length: 200, default: '' })
  description: string;
}
