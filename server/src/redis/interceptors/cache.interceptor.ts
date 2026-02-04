import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RedisService } from '../redis.service';
import {
    CACHE_KEY_METADATA,
    CACHE_TTL_METADATA,
} from '../decorators/cache-key.decorator';
import { DEFAULT_CACHE_TTL, CACHE_PREFIX } from '../cache.constants';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
    constructor(
        private readonly redisService: RedisService,
        private readonly reflector: Reflector,
    ) { }

    async intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Promise<Observable<unknown>> {
        const request = context.switchToHttp().getRequest();

        // Only cache GET requests
        if (request.method !== 'GET') {
            return next.handle();
        }

        // Get cache key from decorator or generate from URL
        const cacheKeyPrefix = this.reflector.get<string>(
            CACHE_KEY_METADATA,
            context.getHandler(),
        );

        // If no cache key is set, don't cache
        if (!cacheKeyPrefix) {
            return next.handle();
        }

        // Generate full cache key including query params
        const queryString = JSON.stringify(request.query || {});
        const cacheKey = `${CACHE_PREFIX}${cacheKeyPrefix}:${request.url}:${queryString}`;

        // Get TTL from decorator or use default
        const ttl =
            this.reflector.get<number>(CACHE_TTL_METADATA, context.getHandler()) ||
            DEFAULT_CACHE_TTL;

        // Try to get from cache
        const cachedResponse = await this.redisService.getJson<unknown>(cacheKey);

        if (cachedResponse !== null) {
            return of(cachedResponse);
        }

        // Execute handler and cache response
        return next.handle().pipe(
            tap(async (response) => {
                await this.redisService.setJson(cacheKey, response, ttl);
            }),
        );
    }
}
