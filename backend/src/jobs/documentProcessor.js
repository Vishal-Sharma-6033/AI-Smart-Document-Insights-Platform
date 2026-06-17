import { documentRepository } from '../repositories/document.repository.js';
import { storageService } from '../services/storage.service.js';
import { extractPdfText } from '../services/pdf.service.js';
import { chunkText } from '../services/chunk.service.js';
import { embedTexts, upsertChunks } from '../services/embedding.service.js';
import { cacheService } from '../services/cache.service.js';
import { DOCUMENT_STATUS } from '../models/Document.model.js';
import { logger } from '../config/logger.js';

export async function processDocument({ documentId, userId }) {
  logger.info(`Processing document ${documentId}`);
  const doc = await documentRepository.findById(documentId);
  if (!doc) {
    logger.warn(`Document ${documentId} no longer exists — skipping`);
    return { skipped: true };
  }

  try {
    await documentRepository.updateStatus(documentId, DOCUMENT_STATUS.PROCESSING);

    const buffer = await storageService.readPdf({
      publicId: doc.publicId,
      url: doc.cloudinaryUrl,
      provider: doc.storageProvider,
    });

    const { text, pageCount } = await extractPdfText(buffer);
    const chunks = await chunkText(text);
    if (chunks.length === 0) throw new Error('No chunks produced from document');

    const vectors = await embedTexts(chunks);
    const stored = await upsertChunks({ userId, documentId, chunks, vectors });

    await documentRepository.updateStatus(documentId, DOCUMENT_STATUS.READY, {
      pageCount,
      chunkCount: stored,
      error: null,
    });
    await cacheService.del(`docs:list:${userId}`);

    logger.info(`Document ${documentId} ready (${stored} chunks)`);
    return { documentId, chunks: stored, pageCount };
  } catch (err) {
    logger.error(`Processing failed for ${documentId}: ${err.message}`);
    await documentRepository.updateStatus(documentId, DOCUMENT_STATUS.FAILED, {
      error: err.message,
    });
    await cacheService.del(`docs:list:${userId}`);
    throw err;
  }
}

export default processDocument;
