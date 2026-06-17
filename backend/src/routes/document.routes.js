import { Router } from 'express';
import { param } from 'express-validator';

import { documentController } from '../controllers/document.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { uploadPdf } from '../middlewares/upload.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

const router = Router();

router.use(requireAuth);

const idValidator = [param('id').isMongoId().withMessage('Invalid document id')];

router.post('/upload', uploadPdf, documentController.upload);
router.get('/', documentController.list);
router.get('/:id', idValidator, validate, documentController.getOne);
router.delete('/:id', idValidator, validate, documentController.remove);

export default router;
