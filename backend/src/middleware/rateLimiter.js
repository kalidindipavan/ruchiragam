/**
 * @file rateLimiter.js
 * @description express-rate-limit configurations for different endpoint groups.
 * Provides brute-force protection and API abuse prevention.
 */

const rateLimit = require('express-rate-limit');
const { sendError } = require('../utils/apiResponse');
const { RATE_LIMITS } = require('../config/constants');

const limiterHandler = (req, res) => {
  return sendError(
    res,
    'Too many requests, please try again later.',
    429
  );
};

/**
 * Auth rate limiter — strict limit for login/register to prevent brute force.
 */
const authLimiter = rateLimit({
  windowMs: RATE_LIMITS.AUTH.windowMs,
  max: RATE_LIMITS.AUTH.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limiterHandler,
  skipSuccessfulRequests: false,
  // Store login attempts by email + IP combo for better accuracy
  keyGenerator: (req) => `${req.ip}-${req.body?.email || 'unknown'}`,
});

/**
 * General API limiter — applied to all routes.
 */
const apiLimiter = rateLimit({
  windowMs: RATE_LIMITS.API.windowMs,
  max: RATE_LIMITS.API.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limiterHandler,
  keyGenerator: (req) => req.ip,
});

/**
 * AI endpoint limiter — prevents OpenAI cost overruns.
 */
const aiLimiter = rateLimit({
  windowMs: RATE_LIMITS.AI.windowMs,
  max: RATE_LIMITS.AI.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limiterHandler,
});

/**
 * Payment limiter — prevents payment initiation spam.
 */
const paymentLimiter = rateLimit({
  windowMs: RATE_LIMITS.PAYMENT.windowMs,
  max: RATE_LIMITS.PAYMENT.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limiterHandler,
  keyGenerator: (req) => req.user?.id || req.ip,
});

module.exports = { authLimiter, apiLimiter, aiLimiter, paymentLimiter };
