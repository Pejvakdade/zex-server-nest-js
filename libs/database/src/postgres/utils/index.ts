/** --------------------------------------------------------------------------------------------------------------------
 * @file index.ts
 * @fileOverview small helpers shared by the Postgres AbstractRepository.
 *
 * @note Miveh's Mongo build ran every read through `convertObjectIds` to stringify ObjectIds.
 *       Postgres primary keys are already uuid strings, so there is nothing to convert — the
 *       hook is kept (as `normalize`) so repositories keep the same shape and a future
 *       serialization concern has one place to live.
 */

/** --------------------------------------------------------------------------------------------------------------------
 * @description pass-through normalizer for read results.
 *
 * @param result
 */
const normalize = <T>(result: T): T => result;

/** --------------------------------------------------------------------------------------------------------------------
 * @description turns the `populate` option into TypeORM's `relations` shape.
 *
 * @param populate
 */
const toRelations = (populate: any): any => {
  if (!populate) return undefined;
  if (typeof populate === 'string') return { [populate]: true };
  if (Array.isArray(populate)) {
    return populate.reduce((acc, key) => ({ ...acc, [String(key)]: true }), {});
  }
  return populate;
};

/** --------------------------------------------------------------------------------------------------------------------
 * @description turns the `select` option into TypeORM's `select` shape.
 *
 * @param select
 */
const toSelect = (select: any): any => {
  if (!select) return undefined;
  if (Array.isArray(select)) {
    return select.reduce((acc, key) => ({ ...acc, [String(key)]: true }), {});
  }
  return select;
};

export default { normalize, toRelations, toSelect };
