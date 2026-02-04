import { Global, Module } from '@nestjs/common';
import { RedisModule as IoRedisModule } from '@nestjs-modules/ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';
import { CacheInterceptor } from './interceptors/cache.interceptor';

@Global()
@Module({
  imports: [
    IoRedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'single',
        url: configService.get<string>('REDIS_URL', 'redis://localhost:6379'),
      }),
    }),
  ],
  providers: [RedisService, CacheInterceptor],
  exports: [RedisService, CacheInterceptor],
})
export class RedisModule { }

