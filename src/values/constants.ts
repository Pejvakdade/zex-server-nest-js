/** --------------------------------------------------------------------------------------------------------------------
 * @define application pagination limitations
 */
export const Pagination = {
  minPage: 1,
  defPage: 1,
  maxPage: 999,
  minLimit: 3,
  maxLimit: 100,
  defLimit: 10,
};

/** --------------------------------------------------------------------------------------------------------------------
 * @define the roles allowed into the admin dashboard. One list so no controller retypes it.
 */
import { UserNamespace } from '@src/app/user/namespace/user.namespace';

export const ADMIN_ROLES: Array<UserNamespace.EUserType> = [
  UserNamespace.EUserType.ADMIN,
  UserNamespace.EUserType.STAFF,
];

export const ADMIN_ONLY: Array<UserNamespace.EUserType> = [UserNamespace.EUserType.ADMIN];

/** Customer-only actions — ordering a plan is something staff do *for* a customer, never for themselves. */
export const CLIENT_ONLY: Array<UserNamespace.EUserType> = [UserNamespace.EUserType.CLIENT];

export const ANY_SIGNED_IN: Array<UserNamespace.EUserType> = [
  UserNamespace.EUserType.ADMIN,
  UserNamespace.EUserType.STAFF,
  UserNamespace.EUserType.CLIENT,
];

/** The global route prefix set in main.ts; anything that builds or matches full paths reads it from here. */
export const API_PREFIX = '/api/v1';
