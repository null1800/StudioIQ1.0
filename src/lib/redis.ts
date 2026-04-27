import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Initialize Redis client
// Note: In development, we might not have these env vars set yet.
// We provide dummy values or handle missing connection gracefully for local dev without redis.
const redisUrl = process.env.UPSTASH_REDIS_REST_URL || '';
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || '';

export const redis = redisUrl && redisToken ? new Redis({
  url: redisUrl,
  token: redisToken,
}) : null;

// Rate limiter: 50 requests per hour per user
export const rateLimiter = redis ? new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(50, '1 h'),
  analytics: true,
}) : null;

export const checkRateLimit = async (userId: string) => {
  if (!rateLimiter) {
    // If Redis is not configured, skip rate limiting (e.g. local dev fallback)
    return { success: true, limit: 50, remaining: 50, reset: 0 };
  }
  
  return await rateLimiter.limit(`ratelimit_${userId}`);
};

// Cache helpers
export const cacheSet = async (key: string, value: any, ttlSeconds: number = 21600) => {
  if (!redis) return;
  await redis.set(key, JSON.stringify(value), { ex: ttlSeconds });
};

export const cacheGet = async <T>(key: string): Promise<T | null> => {
  if (!redis) return null;
  const data = await redis.get<T>(key);
  return data;
};
