import { Worker } from 'bullmq';
import { QUEUE_NAME, bullConnection } from './queues/connection.js';
import { processDocument } from './jobs/documentProcessor.js';
import { connectDB, disconnectDB } from './config/db.js';
import { getRedis, disconnectRedis } from './config/redis.js';
import { logger } from './config/logger.js';

async function bootstrap() {
  await connectDB();
  getRedis();

  const worker = new Worker(QUEUE_NAME, async (job) => processDocument(job.data), {
    connection: { ...bullConnection },
    concurrency: Number(process.env.WORKER_CONCURRENCY) || 2,
  });

  worker.on('completed', (job) => logger.info(`Job ${job.id} completed`));
  worker.on('failed', (job, err) =>
    logger.error(`Job ${job?.id} failed: ${err?.message}`)
  );
  worker.on('error', (err) => logger.warn(`Worker error: ${err.message}`));

  logger.info('Document-processing worker started');

  const shutdown = async (signal) => {
    logger.info(`${signal} received — closing worker`);
    await worker.close();
    await disconnectDB().catch(() => {});
    await disconnectRedis().catch(() => {});
    process.exit(0);
  };
  ['SIGINT', 'SIGTERM'].forEach((sig) => process.on(sig, () => shutdown(sig)));
}

bootstrap().catch((err) => {
  logger.error(`Worker bootstrap failed: ${err.message}`);
  process.exit(1);
});
