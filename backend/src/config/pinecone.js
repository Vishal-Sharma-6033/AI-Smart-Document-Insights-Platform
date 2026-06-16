import { Pinecone } from '@pinecone-database/pinecone';
import { env } from './env.js';
import { logger } from './logger.js';

let client = null;
let index = null;

export function getPineconeIndex() {
  if (!env.pinecone.enabled) return null;
  if (index) return index;

  client = new Pinecone({ apiKey: env.pinecone.apiKey });
  index = client.index(env.pinecone.index);
  logger.info(`Pinecone index "${env.pinecone.index}" ready (dim=${env.huggingface.dimension})`);
  return index;
}

export default getPineconeIndex;
