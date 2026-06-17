import { documentService } from '../services/document.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/ApiResponse.js';

export const documentController = {
  upload: asyncHandler(async (req, res) => {
    const doc = await documentService.upload({
      userId: req.user.sub,
      file: req.file,
      title: req.body.title,
    });
    sendSuccess(res, {
      statusCode: 201,
      message: 'Document uploaded and queued for processing',
      data: { document: doc },
    });
  }),

  list: asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const result = await documentService.list(req.user.sub, { page, limit });
    sendSuccess(res, { message: 'Documents fetched', data: result });
  }),

  getOne: asyncHandler(async (req, res) => {
    const doc = await documentService.getById(req.params.id, req.user.sub);
    sendSuccess(res, { message: 'Document fetched', data: { document: doc } });
  }),

  remove: asyncHandler(async (req, res) => {
    await documentService.remove(req.params.id, req.user.sub);
    sendSuccess(res, { message: 'Document deleted' });
  }),
};

export default documentController;
