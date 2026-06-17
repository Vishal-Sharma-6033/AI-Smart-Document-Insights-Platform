import { Router } from 'express';
import { param } from 'express-validator';

import { chatController } from '../controllers/chat.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

const router = Router();
router.use(requireAuth);

router.get('/', chatController.list);
router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid chat id')],
  validate,
  chatController.remove
);

export default router;
