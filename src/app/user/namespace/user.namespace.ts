/** --------------------------------------------------------------------------------------------------------------------
 * @file user.namespace.ts
 * @fileOverview single source of truth for the user feature's types: table name, enums and interfaces.
 *               Other modules reference these as `UserNamespace.IUser` rather than importing raw types.
 */
import { AbstractEntity } from '@libs/database/src/postgres';

export namespace UserNamespace {
  export const TABLE_NAME = 'user';

  /** ------------------------------------------------------------------------------------------------------------------
   * @description who the account belongs to.
   *   ADMIN  - full access to the admin dashboard
   *   STAFF  - support agents; dashboard access is scoped per-section in later phases
   *   CLIENT - a paying customer, sees only their own services/invoices/tickets
   */
  export enum EUserType {
    ADMIN = 'admin',
    STAFF = 'staff',
    CLIENT = 'client',
  }

  export enum EUserStatus {
    ACTIVE = 'Active',
    SUSPENDED = 'Suspended',
  }

  export interface IUser extends AbstractEntity {
    fullName: string;
    email: string;
    /** bcrypt hash — never returned to a client; see UserService.sanitize. */
    password?: string;
    company?: string;
    userType: EUserType;
    status: EUserStatus;
  }

  /** the shape the API hands back — the hash stripped out. */
  export type IPublicUser = Omit<IUser, 'password'>;

  export interface IAuthResult {
    token: string;
    user: IPublicUser;
  }
}
