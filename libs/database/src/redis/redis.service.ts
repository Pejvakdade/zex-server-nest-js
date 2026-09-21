import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  async set(key: string, value: string, ttl?: number) {
    return ttl
      ? this.redis.set(key, value, 'EX', ttl)
      : this.redis.set(key, value);
  }

  async get(key: string) {
    return this.redis.get(key);
  }

  async del(key: string) {
    return this.redis.del(key);
  }

  /** Deletes every key matching a glob (`blog:*`). SCAN rather than KEYS, so a large keyspace never blocks. */
  async delByPattern(pattern: string): Promise<number> {
    let cursor = '0';
    let removed = 0;

    do {
      const [next, keys] = await this.redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = next;
      if (keys.length) removed += await this.redis.del(...keys);
    } while (cursor !== '0');

    return removed;
  }

  async ttl(key: string) {
    return this.redis.ttl(key);
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }
}
