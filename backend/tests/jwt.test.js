import { describe, it, expect } from 'vitest';
import {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} from '../src/utils/jwt.js';

const fakeUser = { _id: '507f1f77bcf86cd799439011', role: 'user', email: 'a@b.com' };

describe('jwt utils', () => {
  it('signs and verifies an access token round-trip', () => {
    const token = signAccessToken(fakeUser);
    const payload = verifyAccessToken(token);
    expect(payload.sub).toBe(fakeUser._id);
    expect(payload.role).toBe('user');
    expect(payload.email).toBe('a@b.com');
  });

  it('signs unique refresh tokens with a jti', () => {
    const t1 = signRefreshToken(fakeUser);
    const t2 = signRefreshToken(fakeUser);
    expect(t1).not.toBe(t2);
    expect(verifyRefreshToken(t1).sub).toBe(fakeUser._id);
  });

  it('produces a stable sha256 hash for token storage', () => {
    const token = 'some-token';
    expect(hashToken(token)).toBe(hashToken(token));
    expect(hashToken(token)).toHaveLength(64);
  });
});
