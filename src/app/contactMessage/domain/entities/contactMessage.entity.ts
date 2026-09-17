import { Column, Entity } from 'typeorm';

import { AbstractEntity } from '@libs/database/src/postgres';
import { ContactMessageNamespace } from '@src/app/contactMessage/namespace/contactMessage.namespace';

@Entity({ name: ContactMessageNamespace.TABLE_NAME })
export class ContactMessageEntity extends AbstractEntity implements ContactMessageNamespace.IContactMessage {
  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'varchar', length: 180 })
  email: string;

  @Column({ type: 'varchar', length: 200 })
  subject: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: ContactMessageNamespace.EStatus,
    default: ContactMessageNamespace.EStatus.NEW,
  })
  status: ContactMessageNamespace.EStatus;
}
