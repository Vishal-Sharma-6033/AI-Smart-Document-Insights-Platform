import { getOpenAI } from '../config/openai.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

export const llmService = {
  async generateAnswer({ question, context }) {
    const client = getOpenAI();
    if (!client) return devAnswer(question, context);

    try {
      const completion = await client.chat.completions.create({
        model: env.openai.model,
        temperature: 0.2,
        messages: [
          { role: 'system', content: RAG_SYSTEM },
          { role: 'user', content: buildRagPrompt(question, context) },
        ],
      });
      return completion.choices[0]?.message?.content?.trim() || devAnswer(question, context);
    } catch (err) {
      logger.warn(`LLM generation failed, using dev fallback: ${err.message}`);
      return devAnswer(question, context);
    }
  },

  async generateSummary({ text }) {
    const client = getOpenAI();
    if (!client) return devSummary();

    try {
      const completion = await client.chat.completions.create({
        model: env.openai.model,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SUMMARY_SYSTEM },
          { role: 'user', content: buildSummaryPrompt(text) },
        ],
      });
      return safeParseSummary(completion.choices[0]?.message?.content || '');
    } catch (err) {
      logger.warn(`LLM summary failed, using dev fallback: ${err.message}`);
      return devSummary();
    }
  },
};

const RAG_SYSTEM =
  'You are a helpful assistant that answers questions about a document using ONLY the provided context. If the answer is not in the context, say you do not have enough information. Be concise and cite which source section supports your answer.';

const SUMMARY_SYSTEM =
  'You are a document analysis assistant. You always respond with a single valid JSON object and nothing else.';

function buildRagPrompt(question, context) {
  return `Context:
"""
${context}
"""

Question: ${question}`;
}

function buildSummaryPrompt(text) {
  return `Analyze the following document and return a JSON object with exactly these keys:
- "executiveSummary": a 2-3 sentence overview (string)
- "keyInsights": array of 3-6 short strings
- "importantFindings": array of 3-6 short strings
- "actionItems": array of 2-5 short strings

Document:
"""
${text.slice(0, 20000)}
"""

Return only valid JSON.`;
}

function safeParseSummary(raw) {
  try {
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    const parsed = JSON.parse(cleaned);
    return {
      executiveSummary: parsed.executiveSummary || '',
      keyInsights: parsed.keyInsights || [],
      importantFindings: parsed.importantFindings || [],
      actionItems: parsed.actionItems || [],
    };
  } catch {
    return devSummary();
  }
}

function devAnswer(question, context) {
  const snippet = context.slice(0, 300).replace(/\s+/g, ' ').trim();
  return `[dev mode — no LLM configured] Based on the retrieved context, here is the most relevant passage for "${question}": "${snippet}..."`;
}

function devSummary() {
  return {
    executiveSummary:
      '[dev mode] Configure OPENAI_API_KEY for AI-generated summaries. This is placeholder output.',
    keyInsights: ['Insight placeholder 1', 'Insight placeholder 2'],
    importantFindings: ['Finding placeholder 1', 'Finding placeholder 2'],
    actionItems: ['Action item placeholder 1'],
  };
}

export default llmService;
