import { getRedis, isRedisReady } from '../config/redis.js';
import { logger } from '../config/logger.js';

const DEFAULT_TTL = 300;

export const cacheService = {
  async get(key) {
    if (!isRedisReady()) return null;
    try {
      const raw = await getRedis().get(key);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      logger.warn(`cache.get failed for ${key}: ${err.message}`);
      return null;
    }
  },

  async set(key, value, ttlSeconds = DEFAULT_TTL) {
    if (!isRedisReady()) return;
    try {
      await getRedis().set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (err) {
      logger.warn(`cache.set failed for ${key}: ${err.message}`);
    }
  },

  async del(key) {
    if (!isRedisReady()) return;
    try {
      await getRedis().del(key);
    } catch (err) {
      logger.warn(`cache.del failed for ${key}: ${err.message}`);
    }
  },

  async delByPattern(pattern) {
    if (!isRedisReady()) return;
    try {
      const redis = getRedis();
      const stream = redis.scanStream({ match: pattern, count: 100 });
      const pipeline = redis.pipeline();
      let count = 0;
      for await (const keys of stream) {
        for (const key of keys) {
          pipeline.del(key);
          count += 1;
        }
      }
      if (count > 0) await pipeline.exec();
    } catch (err) {
      logger.warn(`cache.delByPattern failed for ${pattern}: ${err.message}`);
    }
  },
};

export default cacheService;
