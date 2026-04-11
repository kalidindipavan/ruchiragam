/**
 * @file authService.js
 * @description Authentication business logic:
 * - User registration with bcrypt password hashing
 * - Login with brute-force protection (account lockout)
 * - JWT access + refresh token management
 * - Refresh token rotation with blacklisting
 * - Google OAuth user upsert
 */

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../config/db');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { AppError } = require('../middleware/errorHandler');
const { MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION_MINUTES, ROLES } = require('../config/constants');
const logger = require('../utils/logger');

const SALT_ROUNDS = 12;

/**
 * Register a new user.
 * @param {object} data - { full_name, email, password, phone }
 * @returns {{ user, accessToken, refreshToken }}
 */
const register = async ({ full_name, email, password, phone }) => {
  // Check if email exists
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email.toLowerCase())
    .single();

  if (existing) {
    throw new AppError('Email already registered', 409);
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const { data: user, error } = await supabase
    .from('users')
    .insert({
      id: uuidv4(),
      full_name,
      email: email.toLowerCase(),
      password_hash: hashedPassword,
      phone: phone || null,
      role: ROLES.USER,
      is_active: true,
      login_attempts: 0,
    })
    .select('id, full_name, email, role, phone, created_at')
    .single();

  if (error) {
    logger.error('Register error:', error);
    throw new AppError('Registration failed', 500);
  }

  const tokens = await _generateAndStoreTokens(user);
  return { user, ...tokens };
};

/**
 * Login with email + password.
 * Implements account lockout after MAX_LOGIN_ATTEMPTS failed attempts.
 */
const login = async ({ email, password }) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (error || !user) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.is_active) {
    throw new AppError('Account suspended. Please contact support.', 403);
  }

  // Check account lockout
  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    const minutesLeft = Math.ceil((new Date(user.locked_until) - new Date()) / 60000);
    throw new AppError(`Account locked. Try again in ${minutesLeft} minutes.`, 429);
  }

  // Verify password
  if (!user.password_hash) {
    throw new AppError('Please login with Google', 400);
  }

  const passwordValid = await bcrypt.compare(password, user.password_hash);

  if (!passwordValid) {
    const attempts = (user.login_attempts || 0) + 1;
    const updateData = { login_attempts: attempts };

    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      updateData.locked_until = new Date(
        Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000
      ).toISOString();
      updateData.login_attempts = 0;
      logger.warn(`Account locked: ${email} after ${attempts} failed attempts`);
    }

    await supabase.from('users').update(updateData).eq('id', user.id);
    throw new AppError('Invalid email or password', 401);
  }

  // Reset login attempts on success
  await supabase.from('users').update({
    login_attempts: 0,
    locked_until: null,
    last_login: new Date().toISOString(),
  }).eq('id', user.id);

  const safeUser = _sanitizeUser(user);
  const tokens = await _generateAndStoreTokens(safeUser);
  return { user: safeUser, ...tokens };
};

/**
 * Refresh access token using a valid refresh token.
 * Implements token rotation (old token is invalidated).
 */
const refreshTokens = async (oldRefreshToken) => {
  if (!oldRefreshToken) throw new AppError('Refresh token required', 401);

  let decoded;
  try {
    decoded = verifyRefreshToken(oldRefreshToken);
  } catch {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  // Check if token exists in DB and isn't blacklisted
  const { data: stored, error } = await supabase
    .from('refresh_tokens')
    .select('*')
    .eq('token', oldRefreshToken)
    .eq('user_id', decoded.userId)
    .eq('is_revoked', false)
    .single();

  if (error || !stored) {
    throw new AppError('Refresh token revoked or not found', 401);
  }

  if (new Date(stored.expires_at) < new Date()) {
    throw new AppError('Refresh token expired', 401);
  }

  // Revoke old token
  await supabase
    .from('refresh_tokens')
    .update({ is_revoked: true })
    .eq('id', stored.id);

  // Fetch current user
  const { data: user } = await supabase
    .from('users')
    .select('id, full_name, email, role, is_active')
    .eq('id', decoded.userId)
    .single();

  if (!user || !user.is_active) {
    throw new AppError('User not found or suspended', 401);
  }

  const tokens = await _generateAndStoreTokens(user);
  return { user, ...tokens };
};

/**
 * Logout — revokes all refresh tokens for user (or just the current one).
 */
const logout = async (userId, refreshToken) => {
  if (refreshToken) {
    await supabase
      .from('refresh_tokens')
      .update({ is_revoked: true })
      .eq('token', refreshToken)
      .eq('user_id', userId);
  } else {
    // Revoke all sessions
    await supabase
      .from('refresh_tokens')
      .update({ is_revoked: true })
      .eq('user_id', userId);
  }
};

/**
 * Upsert Google OAuth user.
 * @param {object} profile - Google profile from passport
 */
const googleOAuthLogin = async (profile) => {
  const email = profile.emails[0].value.toLowerCase();
  const googleId = profile.id;

  // Try to find existing user
  let { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (!user) {
    // Create new user from Google profile
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        id: uuidv4(),
        full_name: profile.displayName,
        email,
        google_id: googleId,
        avatar_url: profile.photos?.[0]?.value || null,
        role: ROLES.USER,
        is_active: true,
        login_attempts: 0,
        email_verified: true,
      })
      .select('id, full_name, email, role, avatar_url')
      .single();

    if (error) throw new AppError('Failed to create OAuth user', 500);
    user = newUser;
  } else if (!user.google_id) {
    // Link Google ID to existing account
    await supabase
      .from('users')
      .update({ google_id: googleId, email_verified: true })
      .eq('id', user.id);
  }

  const safeUser = _sanitizeUser(user);
  const tokens = await _generateAndStoreTokens(safeUser);
  return { user: safeUser, ...tokens };
};

// ─── Private helpers ──────────────────────────────────────────────────────────

const _generateAndStoreTokens = async (user) => {
  const payload = { userId: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken({ userId: user.id });

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  await supabase.from('refresh_tokens').insert({
    id: uuidv4(),
    user_id: user.id,
    token: refreshToken,
    expires_at: expiresAt,
    is_revoked: false,
  });

  return { accessToken, refreshToken };
};

const _sanitizeUser = (user) => ({
  id: user.id,
  full_name: user.full_name,
  email: user.email,
  role: user.role,
  avatar_url: user.avatar_url,
  phone: user.phone,
});

module.exports = { register, login, refreshTokens, logout, googleOAuthLogin };
