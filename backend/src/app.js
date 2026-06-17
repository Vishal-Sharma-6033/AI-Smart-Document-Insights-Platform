import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { env } from './config/env.js';
import { logger } from './config/logger.js';
import apiRoutes from './routes/index.js';
import { notFound, errorHandler } from './middlewares/error.middleware.js';
import { LOCAL_UPLOAD_DIR } from './services/storage.service.js';

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: (origin, cb) => {

      if (!origin || env.clientUrls.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: env.isProd ? 300 : 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
  })
);

if (!env.isProd) {
  app.use((req, _res, next) => {
    logger.debug(`${req.method} ${req.originalUrl}`);
    next();
  });
}

app.use('/uploads', express.static(LOCAL_UPLOAD_DIR));

app.use('/api', apiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
