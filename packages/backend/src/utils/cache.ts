import { createClient } from 'redis';
import { env } from '../config/env';
import { logger } from '../config/logger';

class CacheService {
  public redisClient: ReturnType<typeof createClient> | null = null;
  private localCache = new Map<string, { value: string; expiresAt: number }>();
  public isConnected = false;

  constructor() {
    if (env.REDIS_URL) {
      this.redisClient = createClient({ url: env.REDIS_URL });
      
      this.redisClient.on('error', (err) => {
        logger.warn('Redis Client Error', err);
        this.isConnected = false;
      });

      this.redisClient.on('connect', () => {
        logger.info('Redis connected successfully for caching');
        this.isConnected = true;
      });

      this.redisClient.connect().catch(err => {
        logger.warn('Failed to connect to Redis on startup', err);
      });
    } else {
      logger.info('No REDIS_URL provided. Using local memory cache.');
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      if (this.redisClient && this.isConnected) {
        return await this.redisClient.get(key);
      }
    } catch (e) {
      logger.warn(`Redis get failed for ${key}`, e);
    }

    // Fallback to local
    const item = this.localCache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.localCache.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, ttlSeconds: number = 3600): Promise<void> {
    try {
      if (this.redisClient && this.isConnected) {
        await this.redisClient.setEx(key, ttlSeconds, value);
        return;
      }
    } catch (e) {
      logger.warn(`Redis set failed for ${key}`, e);
    }

    // Fallback to local
    this.localCache.set(key, {
      value,
      expiresAt: Date.now() + (ttlSeconds * 1000)
    });
  }
}

export const cacheService = new CacheService();
