/** --------------------------------------------------------------------------------------------------------------------
 * @file user.entity.ts
 * @fileOverview TypeORM entity for the user table, typed against UserNamespace.IUser.
 */
import { Column, Entity, Index } from 'typeorm';

import { AbstractEntity } from '@libs/database/src/postgres';
import { UserNamespace } from '@src/app/user/namespace/user.namespace';

@Entity({ name: UserNamespace.TABLE_NAME })
export class UserEntity extends AbstractEntity implements UserNamespace.IUser {
  @Column({ type: 'varchar', length: 120 })
  fullName: string;

  /** unique + indexed: every sign-in looks the account up by this column. */
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 180 })
  email: string;

  /** `select: false` keeps the hash out of every query that does not explicitly ask for it. */
  @Column({ type: 'varchar', length: 120, select: false })
  password: string;

  @Column({ type: 'varchar', length: 160, nullable: true })
  company?: string;

  @Column({ type: 'enum', enum: UserNamespace.EUserType, default: UserNamespace.EUserType.CLIENT })
  userType: UserNamespace.EUserType;

  @Column({ type: 'enum', enum: UserNamespace.EUserStatus, default: UserNamespace.EUserStatus.ACTIVE })
  status: UserNamespace.EUserStatus;
}
