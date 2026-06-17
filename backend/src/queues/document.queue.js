import { Queue } from 'bullmq';
import { QUEUE_NAME, bullConnection, defaultJobOptions } from './connection.js';
import { isRedisReady } from '../config/redis.js';
import { logger } from '../config/logger.js';

let queue = null;

function getQueue() {
  if (queue) return queue;
  queue = new Queue(QUEUE_NAME, { connection: { ...bullConnection }, defaultJobOptions });
  queue.on('error', (err) => logger.warn(`Queue error: ${err.message}`));
  return queue;
}

export async function enqueueDocumentProcessing(data) {
  if (!isRedisReady()) {
    logger.warn('Redis unavailable — processing document inline (dev fallback)');
    runInline(data);
    return { inline: true };
  }

  try {
    const job = await getQueue().add('process', data, {});
    return { jobId: job.id };
  } catch (err) {
    logger.warn(`Failed to enqueue (${err.message}) — processing inline`);
    runInline(data);
    return { inline: true };
  }
}

function runInline(data) {
  import('../jobs/documentProcessor.js')
    .then(({ processDocument }) => processDocument(data))
    .catch((err) => logger.error(`Inline processing failed: ${err.message}`));
}

export async function closeQueue() {
  if (queue) await queue.close();
}

export default enqueueDocumentProcessing;
