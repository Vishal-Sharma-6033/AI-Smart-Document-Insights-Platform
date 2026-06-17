import { documentRepository } from '../repositories/document.repository.js';
import { queryChunks, embedText } from './embedding.service.js';
import { llmService } from './llm.service.js';
import { cacheService } from './cache.service.js';
import { DOCUMENT_STATUS } from '../models/Document.model.js';
import { ApiError } from '../utils/ApiError.js';

const summaryCacheKey = (documentId) => `summary:${documentId}`;

export const summaryService = {
  async generate({ userId, documentId }) {
    const doc = await documentRepository.findByIdForUser(documentId, userId);
    if (!doc) throw ApiError.notFound('Document not found');
    if (doc.status !== DOCUMENT_STATUS.READY) {
      throw ApiError.badRequest(`Document is not ready (status: ${doc.status})`);
    }

    const cached = await cacheService.get(summaryCacheKey(documentId));
    if (cached) return cached;

    const overviewVector = await embedText(
      'overview summary key points findings conclusions action items'
    );
    const chunks = await queryChunks({
      userId,
      documentId,
      queryVector: overviewVector,
      topK: 15,
    });
    const text = chunks.map((c) => c.text).join('\n\n');

    const summary = await llmService.generateSummary({ text });
    await cacheService.set(summaryCacheKey(documentId), summary, 24 * 3600);
    return summary;
  },
};

export default summaryService;
