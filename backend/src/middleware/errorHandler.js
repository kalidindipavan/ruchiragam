/**
 * @file errorHandler.js
 * @description Global error handling middleware.
 * Catches all unhandled errors and returns consistent error responses.
 */

const logger = require('../utils/logger');

/**
 * Custom API Error class.
 */
class AppError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not Found handler — converts 404s into AppErrors.
 */
const notFoundHandler = (req, res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404));
};

/**
 * Global error handler middleware.
 * Must be registered LAST in Express middleware chain.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  // Supabase unique constraint violation
  if (err.code === '23505') {
    statusCode = 409;
    message = 'Resource already exists';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Stripe errors
  if (err.type === 'StripeCardError') {
    statusCode = 400;
    message = err.message;
  }

  // Log server errors with full stack
  if (statusCode >= 500) {
    logger.error({
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userId: req.user?.id,
    });

    // Don't leak internal details in production
    if (process.env.NODE_ENV === 'production') {
      message = 'Internal Server Error';
    }
  } else {
    logger.warn({ message, url: req.originalUrl, statusCode });
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { AppError, notFoundHandler, errorHandler };
