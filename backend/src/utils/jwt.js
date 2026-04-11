/**
 * @file jwt.js
 * @description JWT token generation and verification utilities.
 * Access tokens are short-lived (15m). Refresh tokens are long-lived (7d)
 * and stored in DB for rotation + blacklisting.
 */

const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Generate a short-lived access token.
 * @param {object} payload - { userId, email, role }
 * @returns {string} JWT access token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    issuer: 'ruchiragam-api',
    audience: 'ruchiragam-client',
  });
};

/**
 * Generate a refresh token (stored in DB).
 * @param {object} payload - { userId }
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    issuer: 'ruchiragam-api',
    audience: 'ruchiragam-client',
  });
};

/**
 * Verify an access token.
 * @param {string} token
 * @returns {object} Decoded payload
 * @throws {Error} if invalid or expired
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: 'ruchiragam-api',
    audience: 'ruchiragam-client',
  });
};

/**
 * Verify a refresh token.
 * @param {string} token
 * @returns {object} Decoded payload
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET, {
    issuer: 'ruchiragam-api',
    audience: 'ruchiragam-client',
  });
};

/**
 * Decode a token without verification (for expired token info extraction).
 * @param {string} token
 * @returns {object|null}
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
};
