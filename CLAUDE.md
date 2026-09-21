# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

**Progress tracker:** `../PROGRESS.md` lists what is built and what is left, per phase — tick items there as work lands.

NestJS (TypeScript) backend for **ZexServer**, a hosting provider platform (VPS, dedicated servers, web/WordPress hosting, software licenses, support ticketing, billing). Data store is PostgreSQL via TypeORM, with Redis for caching. Uses a monorepo-style layout with shared code in `libs/` alongside the main app in `src/`.

The sibling `ZexServer-angular` repo is the frontend. The design and domain reference for both is `../ZexServerAdditionalPages/` — a Claude Design export (`.dc.html` pages plus `site-data.js` / `support.js`) that is **reference material, not runnable code**.

The structure, naming, Docker style and layering here deliberately mirror the `Miveh` project (`~/Develop/Miveh/Miveh-nest-js`), with two intentional deviations: **PostgreSQL/TypeORM instead of MongoDB/Mongoose**, and official Docker Hub images instead of the Arvan mirror.

## Commands

Bun is both the package manager and the runtime — dev, debug, and production all execute `src/main.ts` directly via `bun`/`bun --watch`, no Node.js and no compiled `dist/` in the loop (the `Dockerfile` runs on `oven/bun` too, not `node`). `nest-cli.json` and `@nestjs/cli` are kept only for `nest generate` scaffolding, not for running or building the app.

```bash
bun run start:dev          # bun --watch src/main.ts
bun run start:debug        # bun --watch --inspect=0.0.0.0:6499 src/main.ts
bun run build              # tsc --noEmit -p tsconfig.build.json — typecheck-only CI gate, emits nothing
bun run start:prod         # bun src/main.ts
bun run lint               # eslint --fix over src, apps, libs, test
bun run format             # prettier --write src/**/*.ts test/**/*.ts
bun run test               # jest unit tests (*.spec.ts next to the code, under src/ and libs/)
bun test                   # the same specs on Bun's own runner (faster; jest globals + tsconfig paths work) - both must stay green
bun run test:e2e           # jest -c test/jest-e2e.json - boots AppModule against the compose stack (needs `docker compose up -d`)
bun run migration:generate src/database/migrations/<Name>   # diff entities vs the DB into a new migration file
bun run migration:run      # apply pending migrations by hand (production applies them itself at boot)
bun run migration:revert   # roll back the last one
```

### Tests

Unit specs mock the repository / Redis / config layer and construct the service directly (`new UserService(repo as never, ...)`) - no Nest testing module, no database. The jest block in `package.json` maps `@libs/*` / `@src/*` and adds `libs/` as a root, so aliases work in specs. `test/app.e2e-spec.ts` is the one integration test: it boots the real `AppModule` with the same pipes / prefix / helmet as `main.ts` against the development Postgres + Redis (seeders included) and walks health, a public read, auth on a guarded route, the admin sign-in, DTO whitelisting and the security headers. `LOG_LEVEL=silent` is set by the script so pino stays quiet.

Path aliases (`@libs/*`, `@src/*`) are resolved natively by Bun at runtime from `tsconfig.json` — no `tsc-alias`/webpack step needed, unlike a typical tsc-built Nest app.

### Local environment

Requires `.env` and `.env.development` (or `.env.production`) — copy from `.env_example` / `.env_example.development` / `.env_example.production`.

`docker compose up -d` brings up **only Postgres and Redis**; the app itself is meant to run natively on the host so WebStorm can attach its Node debugger to the Bun inspector on port `6499`. The `app` service exists but sits behind the `production` profile:

```bash
docker compose up -d                                    # postgres + redis only (development)
docker compose --profile production up --build -d       # full stack
```

## Architecture

### Path aliases

`@libs/*` → `libs/*`, `@src/*` → `src/*` (defined in `tsconfig.json`). Use these instead of relative paths crossing module/lib boundaries.

### Feature module layout

Each domain feature lives under `src/app/<feature>/`. A feature module follows this shape:

- `namespaces/<feature>.namespace.ts` — a TS `namespace` that is the single source of truth for that feature's types: `TABLE_NAME` (Postgres table name), enums, and `I<Feature>` / filter-query interfaces extending `AbstractEntity`. Other modules reference these types via `FeatureNamespace.IFeature` rather than importing raw types.
- `domain/entities/<feature>.entity.ts` — the TypeORM `@Entity()` class for the feature, extending `AbstractEntity`.
- `domain/repositories/<feature>.repository.ts` — `@Injectable()` class extending `AbstractRepository<FeatureNamespace.IFeature>` (from `@libs/database/src/postgres`), injected via `@InjectRepository(FeatureEntity)` plus `@InjectDataSource()`. Add feature-specific queries here; generic CRUD is already provided by the abstract base.
- `interfaces/` — `I<Feature>Repository` / `I<Feature>Service` contracts.
- `dto/` — `class-validator`-decorated request DTOs (create/update/search/get).
- `<feature>.service.ts`, `<feature>.controller.ts`, `<feature>.module.ts`.

### Shared abstractions (`libs/database/src/postgres`)

`AbstractRepository<TEntity extends AbstractEntity>` supplies: `countDocuments`, `create`, `insertMany`, `findOne`, `findById`, `findByIdAndUpdate`, `findOneAndUpdate`, `upsert`, `find`, `findWithPagination` (page/limit/sort/select/populate), `findByIdAndDelete`, `deleteMany`, `startTransaction`. Feature repositories extend this instead of re-implementing CRUD.

The method names are kept identical to Miveh's Mongo version on purpose. Two option names are translated for TypeORM: `populate` → `relations`, `sort` → `order` (see `postgres/utils/index.ts`). `startTransaction()` returns a `QueryRunner` the **caller** must commit/rollback and `release()`.

`AbstractEntity` gives every table a `uuid` `_id` primary key plus `createdAt`/`updatedAt` `timestamptz` columns.

`PostgresModule` wires the TypeORM connection from `ConfigService` (`POSTGRES_HOST`/`PORT`/`USERNAME`/`PASSWORD`/`DATABASE`/`SYNCHRONIZE`/`LOGGING`) with `autoLoadEntities: true`. `synchronize` is on in development and off in production — production changes go through migrations.

`RedisModule` (`libs/database/src/redis`) is configured via `forRootAsync` in `AppModule` from `ConfigService` (`REDIS_HOST`/`REDIS_PORT`/`REDIS_PASSWORD`).

### Response shape

Controllers return a consistent envelope built from `src/values`:

```ts
{ result, message: httpCodeMessage[HttpStatus.X], httpCode: HttpStatus.X, statusCode: values.statusCode.SUCCESS.X }
```

`src/values/httpCodeMessage.ts` and `src/values/statusCode.ts` are the lookup tables; `DeclareApiParam` (`src/values/apiParam.ts`) is the standard `@ApiParam` for `:_id` routes.

### Seeder ordering

Seeders live in `src/database/seeders/` and run from `OnModuleInit`. **Ordering is NOT controlled by the position of modules in `AppModule`'s `imports:` array** — NestJS derives `OnModuleInit` order from the module dependency graph (a module's own `imports:` initialize before the module itself).

Where a dependency chain is a simple single-parent one, express it via the dependent module's own `imports:` array. Where a module is also reached through another module's `imports:` for unrelated DI reasons, don't trust the module-graph distance — instead export the seeder and invoke it explicitly, in order, from the `onModuleInit` of the module that actually depends on it (a plain sequential `await` chain, ordered by JS execution rather than by Nest's scheduling).

### Uploads and the blog

`src/app/upload/` stores admin image uploads under `public/uploads/` (served by `ServeStaticModule`): `POST /upload/banner` insists on an exact 1920×560 hero, `POST /upload/blog-cover` on a minimum 1200×630. `src/app/blog/` is the blog: Markdown bodies stored as-is (the frontend renders and sanitises), slugs derived server-side, public reads cached in Redis under `blog:*` and flushed by `RedisService.delByPattern` on every write.

### Migrations

`synchronize` is on in development only. `src/database/migrations/` holds the TypeORM migrations (`1789474547277-Init.ts` creates the first 11 tables; `1790000000000-BlogPost.ts` adds `blog_post`); `PostgresModule` sets `migrationsRun: !synchronize`, so a production boot applies pending migrations itself before the seeders run. `src/database/data-source.ts` is the standalone DataSource for the CLI scripts (same env files as the app); `migrations.config.ts` holds the shared glob. Bun runs the `.ts` migration files directly - there is no compile step.

Generating a migration needs a database that reflects the *previous* schema, so run `migration:generate` against a copy, not the synchronize-managed dev DB (against that it diffs to nothing). A dev DB that was created by `synchronize` has no `migrations` table: switching it to `POSTGRES_SYNCHRONIZE=false` would make the app try to re-create every table. Either drop and recreate it, or mark the baseline as applied: `INSERT INTO migrations("timestamp", name) VALUES (1789474547277, 'Init1789474547277')`.

Entity pairs that import each other (`ticket.entity` <-> `ticketReply.entity`) type their relation properties as `Relation<T>` (a `type` import) - a bare class annotation emits decorator metadata that throws when the migration CLI loads the files in the other order.

### Hardening (Phase 7)

- **Rate limiting** - `ThrottlerModule` in `AppModule` + `APP_GUARD`: 120 requests / minute / IP everywhere, `@Throttle({ default: { limit: 10, ttl: 60_000 } })` on `sign-in` / `sign-up`. Storage is in-memory (single instance). Responses carry `x-ratelimit-*`.
- **helmet** in `main.ts` with `contentSecurityPolicy: false` - Swagger UI at `/docs` needs inline scripts.
- **CORS** - `CORS_ORIGIN` (comma list) is the allow-list; empty means any origin (development). `credentials: true` only with an explicit list, since a wildcard plus credentials is rejected by browsers.
- **Logging** - `nestjs-pino` (`LoggerModule` in `AppModule`, `app.useLogger` in `main.ts`). One `request completed` line per request with `req.id` / method / url / status / ms; the id is echoed as `x-request-id` (reused if the caller sent one). JSON in production, `pino-pretty` in development, `LOG_LEVEL` overrides. `/api/v1/health` is not logged. `forRoutes: ['*']` is required: nestjs-pino 5 targets Nest 11 / Express 5 and its default wildcard never matches on Nest 10.
- **Docker** - the production image has a `HEALTHCHECK` on `/api/v1/health`; `docker-compose.yml` makes `app` wait for Postgres and Redis to be `service_healthy` (the app migrates on boot).

### Entry point

`src/main.ts`: loads `.env.${APPLICATION_ENV}` (same file `ConfigModule` reads), attaches the pino logger (`bufferLogs`), helmet, raises the body-parser limit to 15mb, enables CORS from `CORS_ORIGIN`, global `ValidationPipe({ whitelist, transform, forbidNonWhitelisted })`, sets up Swagger at `/docs` (config in `src/swagger`), and sets global API prefix `api/v1` (`API_PREFIX` in `src/values/constants.ts`).
