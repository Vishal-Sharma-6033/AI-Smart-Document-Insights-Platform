import { Router } from 'express';
import { isDBConnected } from '../config/db.js';
import { isRedisReady } from '../config/redis.js';
import { sendSuccess } from '../utils/ApiResponse.js';

const router = Router();

router.get('/', (req, res) => {
  sendSuccess(res, {
    message: 'Service healthy',
    data: {
      status: 'ok',
      uptime: process.uptime(),
      services: {
        mongodb: isDBConnected() ? 'connected' : 'down',
        redis: isRedisReady() ? 'connected' : 'down',
      },
    },
  });
});

export default router;
