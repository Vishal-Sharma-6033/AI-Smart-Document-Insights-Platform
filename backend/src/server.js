import app from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { connectDB, disconnectDB } from './config/db.js';
import { getRedis, disconnectRedis } from './config/redis.js';

async function bootstrap() {
  await connectDB();
  getRedis();

  const server = app.listen(env.port, () => {
    logger.info(`API listening on http://localhost:${env.port} [${env.nodeEnv}]`);
  });

  const shutdown = async (signal) => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(async () => {
      await disconnectDB().catch(() => {});
      await disconnectRedis().catch(() => {});
      process.exit(0);
    });

    setTimeout(() => process.exit(1), 10000).unref();
  };

  ['SIGINT', 'SIGTERM'].forEach((sig) => process.on(sig, () => shutdown(sig)));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection', { reason: String(reason) });
  });
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception', { error: err.message, stack: err.stack });
  });
}

bootstrap().catch((err) => {
  logger.error('Fatal error during bootstrap', { error: err.message });
  process.exit(1);
});
