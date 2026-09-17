/** --------------------------------------------------------------------------------------------------------------------
 * @file data-source.ts
 * @fileOverview the standalone TypeORM DataSource the CLI uses for `migration:*` scripts. It reads the
 *               same `.env` + `.env.<APPLICATION_ENV>` pair as the app, so a generate/run targets the
 *               same database the app would. The running app does NOT use this file — PostgresModule
 *               builds its own connection from ConfigService, with the same entity + migration globs.
 *
 * Usage (see package.json):
 *   bun run migration:generate src/database/migrations/AddSomething   # diff entities vs the DB
 *   bun run migration:run                            # apply pending migrations
 *   bun run migration:revert                         # roll back the last one
 */
import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

import { MIGRATIONS_GLOB } from './migrations.config';

dotenv.config({ path: '.env' });
dotenv.config({ path: `.env.${process.env.APPLICATION_ENV || 'development'}` });

export default new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  entities: [`${__dirname}/../**/*.entity.ts`],
  migrations: [MIGRATIONS_GLOB],
});
