/**
 * @file authController.js
 * @description Authentication endpoint controllers.
 */

const authService = require('../services/authService');
const { sendSuccess, sendCreated, sendError } = require('../utils/apiResponse');
const env = require('../config/env');
const logger = require('../utils/logger');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' required for cross-site cookies (Vercel -> Render)
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * POST /api/auth/register
 */
const register = async (req, res) => {
  const result = await authService.register(req.body);

  res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

  return sendCreated(res, {
    user: result.user,
    accessToken: result.accessToken,
  }, 'Registration successful! Welcome to Ruchi Ragam 🍛');
};

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  const result = await authService.login(req.body);

  res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

  return sendSuccess(res, {
    user: result.user,
    accessToken: result.accessToken,
  }, 'Login successful');
};

/**
 * POST /api/auth/refresh
 * Accepts refresh token from HttpOnly cookie or request body.
 */
const refresh = async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  const result = await authService.refreshTokens(token);

  res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

  return sendSuccess(res, {
    user: result.user,
    accessToken: result.accessToken,
  }, 'Token refreshed');
};

/**
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  await authService.logout(req.user.id, token);

  res.clearCookie('refreshToken');
  return sendSuccess(res, null, 'Logged out successfully');
};

/**
 * GET /api/auth/me — Get current user profile.
 */
const getMe = async (req, res) => {
  return sendSuccess(res, req.user, 'User profile fetched');
};

/**
 * GET /api/auth/google/callback — Google OAuth callback.
 * Called by passport after successful OAuth.
 */
const googleCallback = async (req, res) => {
  try {
    const { user, accessToken, refreshToken } = req.user; // Set by passport

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

    // Redirect to frontend with access token in query param (short-lived, client extracts and discards)
    return res.redirect(
      `${env.CLIENT_URL}/auth/callback?token=${accessToken}&success=true`
    );
  } catch (err) {
    logger.error('Google OAuth callback error:', err);
    return res.redirect(`${env.CLIENT_URL}/auth/login?error=oauth_failed`);
  }
};

/**
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res) => {
  await authService.requestPasswordReset(req.body.email);
  return sendSuccess(res, null, 'If that email is in our system, you will receive a reset link shortly.');
};

/**
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res) => {
  const { email, otp, password } = req.body;
  await authService.resetPassword(email, otp, password);
  return sendSuccess(res, null, 'Password has been reset successfully. You can now log in.');
};

module.exports = { register, login, refresh, logout, getMe, googleCallback, forgotPassword, resetPassword };
