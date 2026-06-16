import OpenAI from 'openai';
import { env } from './env.js';
import { logger } from './logger.js';

let client = null;

export function getOpenAI() {
  if (!env.openai.enabled) return null;
  if (!client) {
    client = new OpenAI({
      apiKey: env.openai.apiKey,
      ...(env.openai.baseUrl ? { baseURL: env.openai.baseUrl } : {}),
    });
    logger.info(`OpenAI-compatible LLM ready (model=${env.openai.model})`);
  }
  return client;
}

export default getOpenAI;
