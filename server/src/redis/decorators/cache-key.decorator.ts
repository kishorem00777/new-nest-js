import { SetMetadata } from '@nestjs/common';
import { DEFAULT_CACHE_TTL } from '../cache.constants';

export const CACHE_KEY_METADATA = 'cache_key';
export const CACHE_TTL_METADATA = 'cache_ttl';

/**
 * Decorator to set a cache key for the route
 * @param key - The cache key prefix
 */
export const CacheKey = (key: string) => SetMetadata(CACHE_KEY_METADATA, key);

/**
 * Decorator to set cache TTL in seconds
 * @param ttl - Time to live in seconds (default: 300)
 */
export const CacheTTL = (ttl: number = DEFAULT_CACHE_TTL) =>
    SetMetadata(CACHE_TTL_METADATA, ttl);
