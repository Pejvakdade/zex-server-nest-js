/** --------------------------------------------------------------------------------------------------------------------
 * @file actor.ts
 * @fileOverview the signed-in caller as handed over by the `@User()` decorator, plus the one check
 *               every owner-or-staff endpoint needs.
 */
import { UserNamespace } from '@src/app/user/namespace/user.namespace';
import { ADMIN_ROLES } from '@src/values/constants';

export type TActor = { _id: string; type: UserNamespace.EUserType };

export const isStaff = (actor: TActor): boolean => ADMIN_ROLES.includes(actor?.type);
