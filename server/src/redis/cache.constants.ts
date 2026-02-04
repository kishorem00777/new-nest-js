// Default TTL values in seconds
export const DEFAULT_CACHE_TTL = 300; // 5 minutes
export const SHORT_CACHE_TTL = 60; // 1 minute
export const LONG_CACHE_TTL = 3600; // 1 hour

// Cache key prefixes
export const CACHE_PREFIX = 'cache:';
export const USER_CACHE_PREFIX = 'cache:user:';
export const SESSION_CACHE_PREFIX = 'cache:session:';

// Cache key generators
export const generateCacheKey = (prefix: string, ...parts: (string | number)[]) =>
    `${prefix}${parts.join(':')}`;
