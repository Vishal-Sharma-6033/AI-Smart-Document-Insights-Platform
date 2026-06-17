import { documentRepository } from '../repositories/document.repository.js';
import { storageService } from './storage.service.js';
import { enqueueDocumentProcessing } from '../queues/document.queue.js';
import { deleteDocumentVectors } from './embedding.service.js';
import { cacheService } from './cache.service.js';
import { DOCUMENT_STATUS } from '../models/Document.model.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../config/logger.js';

const docCacheKey = (id) => `doc:${id}`;
const listCacheKey = (userId) => `docs:list:${userId}`;

export const documentService = {
  async upload({ userId, file, title }) {
    const stored = await storageService.uploadPdf(file);

    const doc = await documentRepository.create({
      title: title?.trim() || file.originalname.replace(/\.pdf$/i, ''),
      userId,
      cloudinaryUrl: stored.url,
      publicId: stored.publicId,
      storageProvider: stored.provider,
      status: DOCUMENT_STATUS.UPLOADED,
      sizeBytes: file.size,
    });

    await cacheService.del(listCacheKey(userId));

    await enqueueDocumentProcessing({ documentId: String(doc._id), userId: String(userId) });

    logger.info(`Document uploaded: ${doc._id} (${stored.provider})`);
    return doc;
  },

  async list(userId, { page = 1, limit = 20 } = {}) {
    const cacheKey = listCacheKey(userId);
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      documentRepository.listForUser(userId, { limit, skip }),
      documentRepository.countForUser(userId),
    ]);
    const result = { items, total, page, limit };
    await cacheService.set(cacheKey, result, 60);
    return result;
  },

  async getById(id, userId) {
    const doc = await documentRepository.findByIdForUser(id, userId);
    if (!doc) throw ApiError.notFound('Document not found');
    return doc;
  },

  async remove(id, userId) {
    const doc = await documentRepository.findByIdForUser(id, userId);
    if (!doc) throw ApiError.notFound('Document not found');

    await Promise.allSettled([
      storageService.deleteFile({ publicId: doc.publicId, provider: doc.storageProvider }),
      deleteDocumentVectors({ documentId: String(doc._id), userId: String(userId) }),
    ]);

    await documentRepository.deleteByIdForUser(id, userId);
    await Promise.all([cacheService.del(docCacheKey(id)), cacheService.del(listCacheKey(userId))]);

    logger.info(`Document deleted: ${id}`);
    return { id };
  },
};

export default documentService;
