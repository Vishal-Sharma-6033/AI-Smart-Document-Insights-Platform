import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import documentRoutes from './document.routes.js';
import aiRoutes from './ai.routes.js';
import chatRoutes from './chat.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/documents', documentRoutes);
router.use('/chats', chatRoutes);

router.use('/', aiRoutes);

export default router;
