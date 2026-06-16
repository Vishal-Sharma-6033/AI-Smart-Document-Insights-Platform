import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

let connected = false;

export async function connectDB() {
  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    connected = true;
    logger.info('MongoDB connected');
  } catch (err) {
    if (env.isProd) {
      logger.error('MongoDB connection failed (fatal in production)', { error: err.message });
      throw err;
    }
    logger.warn(`MongoDB unavailable — continuing without DB (dev only): ${err.message}`);
  }

  mongoose.connection.on('disconnected', () => {
    connected = false;
    logger.warn('MongoDB disconnected');
  });
  mongoose.connection.on('reconnected', () => {
    connected = true;
    logger.info('MongoDB reconnected');
  });
}

export function isDBConnected() {
  return connected && mongoose.connection.readyState === 1;
}

export async function disconnectDB() {
  await mongoose.connection.close();
  connected = false;
}
