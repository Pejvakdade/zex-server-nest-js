/** --------------------------------------------------------------------------------------------------------------------
 * @file app.module.ts
 * @fileoverview this file will contain app modules
 *
 * @createdBy Arash Goharrostami
 * @createdAt 2026-09-01 / Tuesday - September 01, 2026
 */

/** --------------------------------------------------------------------------------------------------------------------
 * @define imports from node_module
 */
import { join } from 'path';
import { randomUUID } from 'crypto';
import type { IncomingMessage } from 'http';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';

/** --------------------------------------------------------------------------------------------------------------------
 * @define imports from my custom library
 */
import { RedisModule } from '@libs/database/src/redis/redis.module';
import { PostgresModule } from '@libs/database/src/postgres';
import { GateKeeperModule } from '@libs/gateKeeper';
import { API_PREFIX } from '@src/values/constants';

/** --------------------------------------------------------------------------------------------------------------------
 * @define imports from application modules
 */
import { HealthModule } from './health/health.module';
import { UsersModule } from './user/user.module';
import { StatsModule } from './stats/stats.module';
import { PlanModule } from './plan/plan.module';
import { LocationModule } from './location/location.module';
import { ProductContentModule } from './productContent/productContent.module';
import { SiteContentModule } from './siteContent/siteContent.module';
import { LicenseModule } from './license/license.module';
import { ServiceModule } from './service/service.module';
import { InvoiceModule } from './invoice/invoice.module';
import { TicketModule } from './ticket/ticket.module';
import { OrderModule } from './order/order.module';

/** --------------------------------------------------------------------------------------------------------------------
 * @define AppModule the main module
 * @module AppModule
 * @export
 * @class
 */
@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../', 'public'),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', `.env.${process.env.APPLICATION_ENV || 'development'}`],
    }),
    /** ----------------------------------------------------------------------------------------------------------------
     * @description structured request logging. Every request gets an id (echoed back as `x-request-id`,
     * or reused when the caller sends one) and a single completion line with method / url / status / ms.
     * Production emits JSON lines; development pretty-prints. The health probe is not logged — it fires
     * every few seconds from Docker and would drown everything else.
     */
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProduction = config.get<string>('APPLICATION_ENV') === 'production';

        return {
          // nestjs-pino 5 targets Nest 11 / Express 5 and mounts its middleware on `{/*splat}`, a
          // wildcard the Express 4 router in Nest 10 never matches - so no request would be logged.
          // An explicit Express-4 wildcard puts it on every route.
          forRoutes: ['*'],
          pinoHttp: {
            level: config.get<string>('LOG_LEVEL') || (isProduction ? 'info' : 'debug'),
            genReqId: (request, response) => {
              const id = (request.headers['x-request-id'] as string) || randomUUID();
              response.setHeader('x-request-id', id);
              return id;
            },
            // One compact line per request: id / method / url in, status out. pino-http's defaults
            // would dump every request and response header on each line.
            serializers: {
              req: (request) => ({ id: request.id, method: request.method, url: request.url }),
              res: (response) => ({ statusCode: response.statusCode }),
            },
            autoLogging: {
              ignore: (request: IncomingMessage & { originalUrl?: string }) =>
                (request.originalUrl || request.url) === `${API_PREFIX}/health`,
            },
            transport: isProduction ? undefined : { target: 'pino-pretty', options: { singleLine: true } },
          },
        };
      },
    }),
    /** ----------------------------------------------------------------------------------------------------------------
     * @description rate limiting, applied to every route through APP_GUARD. The default bucket is generous;
     * the credential endpoints override it with a much tighter one (see user.controller.ts).
     * Storage is in-memory: this runs as a single instance.
     */
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 120 }]),
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        host: config.get<string>('REDIS_HOST'),
        port: config.get<number>('REDIS_PORT'),
        password: config.get<string>('REDIS_PASSWORD') || undefined,
      }),
    }),
    /** ----------------------------------------------------------------------------------------------------------------
     * @NOTE Textual order in this array does NOT control seeder execution order. NestJS runs
     * OnModuleInit hooks in an order derived from the module dependency graph (a module's own
     * `imports:` initialize before the module itself), not from array position here. When a new
     * module's seeder depends on another collection already being populated, add that module to
     * its own `imports:` array - or, if that would create a cycle, invoke its seeder explicitly
     * from the module it actually depends on. See CLAUDE.md.
     */
    GateKeeperModule,
    PostgresModule,
    UsersModule,
    LocationModule,
    PlanModule,
    ProductContentModule,
    SiteContentModule,
    LicenseModule,
    ServiceModule,
    InvoiceModule,
    TicketModule,
    OrderModule,
    StatsModule,
    HealthModule,
  ],
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
