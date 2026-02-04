export const ACCESS_TOKEN_EXPIRY = '15m';
export const REFRESH_TOKEN_EXPIRY = '7d';
export const REFRESH_TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days in seconds

// Redis key patterns
export const REFRESH_TOKEN_KEY = (userId: number, tokenId: string) =>
  `refresh_token:${userId}:${tokenId}`;
export const USER_TOKENS_PATTERN = (userId: number) =>
  `refresh_token:${userId}:*`;
