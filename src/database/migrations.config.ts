/** --------------------------------------------------------------------------------------------------------------------
 * @file migrations.config.ts
 * @fileOverview where migration files live. Shared by the running app (PostgresModule) and the CLI
 *               DataSource (data-source.ts) so both always agree on the folder.
 */
export const MIGRATIONS_GLOB = `${__dirname}/migrations/*.ts`;
