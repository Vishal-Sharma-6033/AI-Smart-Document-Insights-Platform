import { env } from '../config/env.js';

export const QUEUE_NAME = 'document-processing';

export const bullConnection = {

  url: env.redisUrl,
  maxRetriesPerRequest: null,
};

export const defaultJobOptions = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 5000 },
  removeOnComplete: { age: 3600, count: 100 },
  removeOnFail: { age: 24 * 3600 },
};
