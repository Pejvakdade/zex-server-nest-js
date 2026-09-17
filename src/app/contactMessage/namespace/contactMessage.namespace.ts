/** --------------------------------------------------------------------------------------------------------------------
 * @file contactMessage.namespace.ts
 * @fileOverview messages submitted through the public contact form.
 */
import { AbstractEntity } from '@libs/database/src/postgres';

export namespace ContactMessageNamespace {
  export const TABLE_NAME = 'contact_message';

  export enum EStatus {
    NEW = 'New',
    READ = 'Read',
    ARCHIVED = 'Archived',
  }

  export interface IContactMessage extends AbstractEntity {
    name: string;
    email: string;
    subject: string;
    message: string;
    status: EStatus;
  }
}
