import { describe, it, expect } from 'vitest';
import { chunkText } from '../src/services/chunk.service.js';

describe('chunkText', () => {
  it('returns a single chunk for short text', async () => {
    const chunks = await chunkText('Hello world. This is a short document.');
    expect(chunks.length).toBe(1);
    expect(chunks[0]).toContain('Hello world');
  });

  it('splits long text into multiple overlapping chunks', async () => {
    const para = 'The quick brown fox jumps over the lazy dog. '.repeat(120); // ~5400 chars
    const chunks = await chunkText(para, { chunkSize: 1000, chunkOverlap: 200 });
    expect(chunks.length).toBeGreaterThan(1);
    // No chunk should greatly exceed the configured size.
    for (const c of chunks) expect(c.length).toBeLessThanOrEqual(1100);
  });

  it('drops empty input to an empty array', async () => {
    const chunks = await chunkText('   ');
    expect(chunks).toEqual([]);
  });
});
