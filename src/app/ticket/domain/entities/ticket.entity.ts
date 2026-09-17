import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, type Relation } from 'typeorm';

import { AbstractEntity } from '@libs/database/src/postgres';
import { ServiceEntity } from '@src/app/service/domain/entities/service.entity';
import { TicketNamespace } from '@src/app/ticket/namespace/ticket.namespace';
import { UserEntity } from '@src/app/user/domain/entities/user.entity';
import { TicketReplyEntity } from './ticketReply.entity';

@Entity({ name: TicketNamespace.TABLE_NAME })
export class TicketEntity extends AbstractEntity implements TicketNamespace.ITicket {
  @Index({ unique: true })
  @Column({ type: 'integer' })
  number: number;

  @Column({ type: 'varchar', length: 200 })
  subject: string;

  @Column({ type: 'text' })
  message: string;

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

  @Column({ type: 'enum', enum: TicketNamespace.EPriority, default: TicketNamespace.EPriority.MEDIUM })
  priority: TicketNamespace.EPriority;

  @Column({ type: 'enum', enum: TicketNamespace.EStatus, default: TicketNamespace.EStatus.OPEN })
  status: TicketNamespace.EStatus;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  lastActivityAt: Date;

  @OneToMany(() => TicketReplyEntity, (reply) => reply.ticket)
  replies?: Array<Relation<TicketReplyEntity>>;
}
