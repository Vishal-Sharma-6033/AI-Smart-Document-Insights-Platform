import { ragService } from '../services/rag.service.js';
import { summaryService } from '../services/summary.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/ApiResponse.js';

export const aiController = {
  chat: asyncHandler(async (req, res) => {
    const { documentId, question } = req.body;
    const result = await ragService.ask({
      userId: req.user.sub,
      documentId,
      question,
    });
    sendSuccess(res, { message: 'Answer generated', data: result });
  }),

  summary: asyncHandler(async (req, res) => {
    const { documentId } = req.body;
    const summary = await summaryService.generate({
      userId: req.user.sub,
      documentId,
    });
    sendSuccess(res, { message: 'Summary generated', data: { summary } });
  }),
};

export default aiController;
