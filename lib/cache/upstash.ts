import { Redis } from '@upstash/redis';

let redisInstance: Redis | null | undefined;

export function getUpstashRedis(): Redis | null {
  if (redisInstance !== undefined) {
    return redisInstance;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    redisInstance = null;
    return redisInstance;
  }

  redisInstance = new Redis({ url, token });
  return redisInstance;
}
