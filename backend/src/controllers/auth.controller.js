import { authService } from '../services/auth.service.js';
import { userRepository } from '../repositories/user.repository.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

const REFRESH_COOKIE = 'refreshToken';

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? 'strict' : 'lax',
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE, token, refreshCookieOptions());
}

export const authController = {
  register: asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.register({
      name,
      email,
      password,
    });
    setRefreshCookie(res, refreshToken);
    sendSuccess(res, {
      statusCode: 201,
      message: 'Registration successful',
      data: { user, accessToken },
    });
  }),

  login: asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login({ email, password });
    setRefreshCookie(res, refreshToken);
    sendSuccess(res, { message: 'Login successful', data: { user, accessToken } });
  }),

  refresh: asyncHandler(async (req, res) => {
    const token = req.cookies?.[REFRESH_COOKIE] || req.body?.refreshToken;
    const { user, accessToken, refreshToken } = await authService.refresh(token);
    setRefreshCookie(res, refreshToken);
    sendSuccess(res, { message: 'Token refreshed', data: { user, accessToken } });
  }),

  logout: asyncHandler(async (req, res) => {
    const token = req.cookies?.[REFRESH_COOKIE] || req.body?.refreshToken;
    await authService.logout(token);
    res.clearCookie(REFRESH_COOKIE, { ...refreshCookieOptions(), maxAge: undefined });
    sendSuccess(res, { message: 'Logged out' });
  }),

  me: asyncHandler(async (req, res) => {
    const user = await userRepository.findById(req.user.sub);
    if (!user) throw ApiError.notFound('User not found');
    sendSuccess(res, { message: 'Current user', data: { user } });
  }),
};

export default authController;
