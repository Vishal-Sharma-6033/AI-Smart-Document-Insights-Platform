import { Router } from 'express';
import { body } from 'express-validator';

import { aiController } from '../controllers/ai.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

const router = Router();

router.post(
  '/chat',
  requireAuth,
  [
    body('documentId').isMongoId().withMessage('Valid documentId required'),
    body('question').trim().isLength({ min: 1, max: 2000 }).withMessage('Question required'),
  ],
  validate,
  aiController.chat
);

router.post(
  '/summary',
  requireAuth,
  [body('documentId').isMongoId().withMessage('Valid documentId required')],
  validate,
  aiController.summary
);

export default router;
