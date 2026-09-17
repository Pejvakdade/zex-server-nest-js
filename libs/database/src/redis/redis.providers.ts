import Redis from 'ioredis';
import { REDIS_CLIENT, REDIS_MODULE_OPTIONS } from './redis.constants';
import { RedisModuleOptions } from './redis.interfaces';

export const redisProvider = {
  provide: REDIS_CLIENT,
  useFactory: (options: RedisModuleOptions) => {
    return new Redis(options);
  },
  inject: [REDIS_MODULE_OPTIONS],
};
