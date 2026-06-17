import crypto from 'node:crypto';
import { HfInference } from '@huggingface/inference';

import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { getPineconeIndex } from '../config/pinecone.js';

let hf = null;
function getHf() {
  if (!env.huggingface.enabled) return null;
  if (!hf) hf = new HfInference(env.huggingface.apiKey);
  return hf;
}

function devEmbed(text) {
  const dim = env.huggingface.dimension;
  const vec = new Array(dim).fill(0);
  const tokens = text.toLowerCase().split(/\s+/).filter(Boolean);
  for (const tok of tokens) {
    const h = crypto.createHash('md5').update(tok).digest();
    const idx = h.readUInt32BE(0) % dim;
    vec[idx] += 1;
  }
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
}

async function withRetry(fn, { attempts = 3, baseMs = 500 } = {}) {
  let lastErr;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, baseMs * 2 ** i));
    }
  }
  throw lastErr;
}

export async function embedText(text) {
  const client = getHf();
  if (!client) return devEmbed(text);

  try {
    const out = await withRetry(() =>
      client.featureExtraction({ model: env.huggingface.model, inputs: text })
    );

    const vec = Array.isArray(out[0]) ? out[0] : out;
    return vec;
  } catch (err) {
    logger.warn(`HuggingFace embedding failed, using dev fallback: ${err.message}`);
    return devEmbed(text);
  }
}

export async function embedTexts(texts) {
  const vectors = [];
  for (const t of texts) {

    vectors.push(await embedText(t));
  }
  return vectors;
}

const memoryStore = new Map();

function cosine(a, b) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

export async function upsertChunks({ userId, documentId, chunks, vectors }) {
  const records = chunks.map((chunk, i) => ({
    id: `${documentId}:${i}`,
    values: vectors[i],
    metadata: { documentId, userId, chunkIndex: i, text: chunk },
  }));

  const index = getPineconeIndex();
  if (index) {
    await index.namespace(userId).upsert(records);
  } else {
    memoryStore.set(userId, [
      ...(memoryStore.get(userId) || []).filter((r) => r.metadata.documentId !== documentId),
      ...records,
    ]);
  }
  return records.length;
}

export async function queryChunks({ userId, documentId, queryVector, topK = 5 }) {
  const index = getPineconeIndex();
  if (index) {
    const res = await index.namespace(userId).query({
      vector: queryVector,
      topK,
      includeMetadata: true,
      filter: { documentId: { $eq: documentId } },
    });
    return (res.matches || []).map((m) => ({
      score: m.score,
      text: m.metadata?.text || '',
      chunkIndex: m.metadata?.chunkIndex,
    }));
  }

  const records = (memoryStore.get(userId) || []).filter(
    (r) => r.metadata.documentId === documentId
  );
  return records
    .map((r) => ({
      score: cosine(queryVector, r.values),
      text: r.metadata.text,
      chunkIndex: r.metadata.chunkIndex,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

export async function deleteDocumentVectors({ userId, documentId }) {
  const index = getPineconeIndex();
  if (index) {
    try {
      await index.namespace(userId).deleteMany({ documentId: { $eq: documentId } });
    } catch (err) {
      logger.warn(`Pinecone delete failed for ${documentId}: ${err.message}`);
    }
  } else {
    const existing = memoryStore.get(userId) || [];
    memoryStore.set(
      userId,
      existing.filter((r) => r.metadata.documentId !== documentId)
    );
  }
}
