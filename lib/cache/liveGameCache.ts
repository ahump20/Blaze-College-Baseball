import { Redis } from '@upstash/redis';
import crypto from 'crypto';
import { getUpstashRedis } from './upstash';

const DEFAULT_TTL_SECONDS = 60;

export type CacheableGame = {
  id: string;
  status: string;
  startTime: string;
  homeTeam: { slug: string; score: number };
  awayTeam: { slug: string; score: number };
  updatedAt: string;
};

export interface LiveGameCachePayload {
  games: CacheableGame[];
  generatedAt: string;
  scoreHash: string;
}

export class LiveGameCache {
  private readonly redis: Redis | null;

  constructor(redisInstance?: Redis) {
    this.redis = redisInstance ?? getUpstashRedis();
  }

  async read(key: string): Promise<LiveGameCachePayload | null> {
    if (!this.redis) {
      return null;
    }

    const result = await this.redis.get<LiveGameCachePayload>(key);
    return result ?? null;
  }

  async write(key: string, games: CacheableGame[], ttlSeconds: number = DEFAULT_TTL_SECONDS) {
    if (!this.redis) {
      return;
    }

    const payload: LiveGameCachePayload = {
      games,
      generatedAt: new Date().toISOString(),
      scoreHash: this.computeScoreHash(games)
    };

    await this.redis.set(key, payload, { ex: Math.min(ttlSeconds, DEFAULT_TTL_SECONDS) });
  }

  async invalidateIfScoreChanged(key: string, games: CacheableGame[]): Promise<boolean> {
    if (!this.redis) {
      return false;
    }

    const cached = await this.read(key);
    const nextHash = this.computeScoreHash(games);

    if (cached && cached.scoreHash !== nextHash) {
      await this.redis.del(key);
      return true;
    }

    return false;
  }

  computeScoreHash(games: CacheableGame[]): string {
    const digest = games
      .map((game) => `${game.id}:${game.status}:${game.homeTeam.score}-${game.awayTeam.score}`)
      .sort()
      .join('|');

    return crypto.createHash('sha1').update(digest).digest('hex');
  }
}

export function serializeGamesForCache(games: CacheableGame[]): LiveGameCachePayload {
  const cache = new LiveGameCache();
  return {
    games,
    generatedAt: new Date().toISOString(),
    scoreHash: cache.computeScoreHash(games)
  };
}
