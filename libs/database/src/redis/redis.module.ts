import { DynamicModule, Global, Module } from '@nestjs/common';
import { redisProvider } from './redis.providers';
import { REDIS_MODULE_OPTIONS } from './redis.constants';
import { RedisModuleOptions } from './redis.interfaces';
import { RedisService } from './redis.service';

@Global()
@Module({})
export class RedisModule {
  static forRoot(options: RedisModuleOptions): DynamicModule {
    return {
      module: RedisModule,
      providers: [
        {
          provide: REDIS_MODULE_OPTIONS,
          useValue: options,
        },
        redisProvider,
        RedisService,
      ],
      exports: [RedisService, redisProvider],
    };
  }

  static forRootAsync(options: {
    useFactory: (...args: any[]) => RedisModuleOptions;
    inject?: any[];
  }): DynamicModule {
    return {
      module: RedisModule,
      providers: [
        {
          provide: REDIS_MODULE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject ?? [],
        },
        redisProvider,
        RedisService,
      ],
      exports: [RedisService, redisProvider],
    };
  }
}
