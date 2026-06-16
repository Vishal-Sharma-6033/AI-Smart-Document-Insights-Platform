import Redis from 'ioredis';
import { env } from './env.js';
import { logger } from './logger.js';

let client = null;
let ready = false;

export function getRedis() {
  if (client) return client;

  client = new Redis(env.redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    retryStrategy: (times) => Math.min(times * 200, 5000),
    lazyConnect: false,
  });

  client.on('ready', () => {
    ready = true;
    logger.info('Redis connected');
  });
  client.on('error', (err) => {
    ready = false;
    logger.warn(`Redis error: ${err.message}`);
  });
  client.on('end', () => {
    ready = false;
  });

  return client;
}

export function isRedisReady() {
  return ready;
}

export async function disconnectRedis() {
  if (client) {
    await client.quit();
    client = null;
    ready = false;
  }
}
