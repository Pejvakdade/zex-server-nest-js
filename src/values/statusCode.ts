/** --------------------------------------------------------------------------------------------------------------------
 * @file statusCode.ts
 * @fileOverview this file will keep global error codes.
 * @createdBy Arash Goharrostami
 * @createdAt 2026-09-01 / Tuesday - September 01, 2026
 *
 * @description
 *
 *   error code's order in this microService is like this
 *
 *     - range of 2000 to 2999 are Success ( Global )
 *     - range of 4000 to 4999 are Error   ( Global )
 *     - range of 6000 to 6999 are belong to application domain entities
 *     - range of 7000 to 7999 are belong to application Main
 */

/** --------------------------------------------------------------------------------------------------------------------
 * @description main const variable of this file.
 */
const statusCode = {
  SUCCESS: {
    OK: 2000,
    CREATE: 2001,
    UPDATE: 2002,
    DELETE: 2003,
  },
  ERROR: {
    NO_TOKEN_PROVIDED: 4001,
    INVALID_OR_EXPIRED_TOKEN: 4002,
    FORBIDDEN_U_DONT_HAVE_REQUIRED_ROLE: 4003,
    INVALID_CREDENTIALS: 4004,
    CANNOT_MODIFY_SELF: 4005,

    USER: {
      NOT_FOUND: 6000,
      IS_DUPLICATED: 6001,
      IS_BLOCKED: 6002,
    },
    PLAN: {
      NOT_FOUND: 6050,
      IS_DUPLICATED: 6051,
    },
    LOCATION: {
      NOT_FOUND: 6100,
      IS_DUPLICATED: 6101,
    },
    PRODUCT_CONTENT: {
      NOT_FOUND: 6150,
      IS_DUPLICATED: 6151,
    },
    SERVICE: {
      NOT_FOUND: 6200,
      IS_DUPLICATED: 6201,
      FORBIDDEN_NOT_OWNER: 6202,
    },
    TICKET: {
      NOT_FOUND: 6250,
      IS_DUPLICATED: 6251,
      ALREADY_CLOSED: 6252,
      FORBIDDEN_NOT_OWNER: 6253,
    },
    INVOICE: {
      NOT_FOUND: 6300,
      IS_DUPLICATED: 6301,
      ALREADY_PAID: 6302,
      FORBIDDEN_NOT_OWNER: 6303,
    },
    LICENSE: {
      NOT_FOUND: 6350,
      IS_DUPLICATED: 6351,
    },
    CONTACT_MESSAGE: {
      NOT_FOUND: 6400,
    },
    SITE_CONTENT: {
      NOT_FOUND: 6450,
    },
  },
};

/** --------------------------------------------------------------------------------------------------------------------
 * @description export main constant variable as default
 * @export
 */
export default statusCode;
