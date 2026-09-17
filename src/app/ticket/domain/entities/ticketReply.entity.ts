import { Column, Entity, Index, JoinColumn, ManyToOne, type Relation } from 'typeorm';

import { AbstractEntity } from '@libs/database/src/postgres';
import { TicketNamespace } from '@src/app/ticket/namespace/ticket.namespace';
import { TicketEntity } from './ticket.entity';

@Entity({ name: TicketNamespace.REPLY_TABLE_NAME })
export class TicketReplyEntity extends AbstractEntity implements TicketNamespace.ITicketReply {
  @Index()
  @Column({ type: 'uuid' })
  ticketId: string;

  @ManyToOne(() => TicketEntity, (ticket) => ticket.replies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticketId' })
  // Relation<> keeps the decorator metadata from touching TicketEntity while the two files are still
  // importing each other (ticket.entity <-> ticketReply.entity) - a plain type annotation throws when
  // the migration CLI happens to load this file first.
  ticket?: Relation<TicketEntity>;

  @Column({ type: 'uuid' })
  authorId: string;

  @Column({ type: 'enum', enum: TicketNamespace.EAuthorType })
  authorType: TicketNamespace.EAuthorType;

  @Column({ type: 'varchar', length: 120 })
  authorName: string;

  @Column({ type: 'text' })
  text: string;
}
