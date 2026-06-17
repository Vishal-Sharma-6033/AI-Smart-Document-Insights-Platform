import crypto from 'node:crypto';

import { documentRepository } from '../repositories/document.repository.js';
import { chatRepository } from '../repositories/chat.repository.js';
import { embedText, queryChunks } from './embedding.service.js';
import { llmService } from './llm.service.js';
import { cacheService } from './cache.service.js';
import { DOCUMENT_STATUS } from '../models/Document.model.js';
import { ApiError } from '../utils/ApiError.js';

const TOP_K = 5;
const chatCacheKey = (documentId, question) =>
  `chat:${documentId}:${crypto.createHash('sha256').update(question).digest('hex')}`;

function buildContext(chunks) {
  return chunks
    .map((c, i) => `[Source ${i + 1} | chunk ${c.chunkIndex}]\n${c.text}`)
    .join('\n\n');
}

export const ragService = {
  async ask({ userId, documentId, question }) {
    const doc = await documentRepository.findByIdForUser(documentId, userId);
    if (!doc) throw ApiError.notFound('Document not found');
    if (doc.status !== DOCUMENT_STATUS.READY) {
      throw ApiError.badRequest(`Document is not ready (status: ${doc.status})`);
    }

    const cacheKey = chatCacheKey(documentId, question.trim().toLowerCase());
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      await chatRepository.create({ userId, documentId, ...cached });
      return cached;
    }

    const queryVector = await embedText(question);
    const chunks = await queryChunks({ userId, documentId, queryVector, topK: TOP_K });

    if (chunks.length === 0) {
      throw ApiError.badRequest('No indexed content found for this document');
    }

    const context = buildContext(chunks);
    const answer = await llmService.generateAnswer({ question, context });

    const sources = chunks.map((c) => ({
      chunkIndex: c.chunkIndex,
      text: c.text.slice(0, 400),
      score: c.score,
    }));

    const payload = { question, answer, sources };
    await chatRepository.create({ userId, documentId, ...payload });
    await cacheService.set(cacheKey, payload, 3600);

    return payload;
  },
};

export default ragService;
