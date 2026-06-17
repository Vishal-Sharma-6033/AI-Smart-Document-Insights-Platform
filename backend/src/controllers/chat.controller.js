import { chatRepository } from '../repositories/chat.repository.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

export const chatController = {
  list: asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 30, 100);
    const documentId = req.query.documentId || undefined;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      chatRepository.listForUser(req.user.sub, { documentId, limit, skip }),
      chatRepository.countForUser(req.user.sub, { documentId }),
    ]);
    sendSuccess(res, { message: 'Chats fetched', data: { items, total, page, limit } });
  }),

  remove: asyncHandler(async (req, res) => {
    const deleted = await chatRepository.deleteByIdForUser(req.params.id, req.user.sub);
    if (!deleted) throw ApiError.notFound('Chat not found');
    sendSuccess(res, { message: 'Chat deleted' });
  }),
};

export default chatController;
