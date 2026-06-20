import { userRepository } from '../repositories/user.repository.js';
import { ApiError } from '../utils/ApiError.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} from '../utils/jwt.js';

export const authService = {
  async register({ name, email, password }) {
    const existing = await userRepository.findByEmail(email);
    if (existing) throw ApiError.conflict('Email already registered');

    const user = await userRepository.create({ name, email, password });
    return this.issueTokens(user);
  },

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email, { withPassword: true });
    if (!user) throw ApiError.unauthorized('Invalid credentials');

    const ok = await user.comparePassword(password);
    if (!ok) throw ApiError.unauthorized('Invalid credentials');

    return this.issueTokens(user);
  },

  async refresh(refreshToken) {
    if (!refreshToken) throw ApiError.unauthorized('Refresh token missing');

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    const user = await userRepository.findByIdWithRefreshTokens(payload.sub);
    if (!user) throw ApiError.unauthorized('User no longer exists');

    const incomingHash = hashToken(refreshToken);
    if (!user.refreshTokens.includes(incomingHash)) {

      await userRepository.clearRefreshTokens(user._id);
      throw ApiError.unauthorized('Refresh token revoked');
    }

    const accessToken = signAccessToken(user);
    const newRefresh = signRefreshToken(user);
    await userRepository.replaceRefreshToken(user._id, incomingHash, hashToken(newRefresh));

    return { user, accessToken, refreshToken: newRefresh };
  },

  async logout(refreshToken) {
    if (!refreshToken) return;
    try {
      const payload = verifyRefreshToken(refreshToken);
      await userRepository.removeRefreshToken(payload.sub, hashToken(refreshToken));
    } catch {
      // Ignore token verification/removal errors during logout
    }
  },

  async issueTokens(user) {
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    await userRepository.addRefreshToken(user._id, hashToken(refreshToken));
    return { user, accessToken, refreshToken };
  },
};

export default authService;
