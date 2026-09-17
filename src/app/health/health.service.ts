/** --------------------------------------------------------------------------------------------------------------------
 * @file health.service.ts
 * @fileOverview verifies that the two backing stores (Postgres, Redis) are actually reachable.
 */
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

import { RedisService } from '@libs/database/src/redis';

@Injectable()
export class HealthService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly redisService: RedisService,
  ) {}

  /** ------------------------------------------------------------------------------------------------------------------
   * @description pings Postgres and Redis, reporting each independently so a single failing
   *              dependency is identifiable rather than collapsing the whole check.
   */
  public async check(): Promise<{ postgres: string; redis: string }> {
    const postgres = await this.dataSource
      .query('SELECT 1')
      .then(() => 'ok')
      .catch((error) => `error: ${error.message}`);

    const redis = await this.redisService
      .set('health:ping', String(Date.now()), 10)
      .then(() => 'ok')
      .catch((error) => `error: ${error.message}`);

    return { postgres, redis };
  }
}
