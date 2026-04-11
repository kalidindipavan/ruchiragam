/**
 * @file server.js
 * @description HTTP server entry point.
 * Handles graceful shutdown and uncaught exception handling.
 */

require('dotenv').config();

const app = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');
const { supabase } = require('./config/db');

const PORT = env.PORT || 5000;

// ─── Database Connectivity Check ─────────────────────────────────────────────

const checkDatabaseConnection = async () => {
  try {
    const { error } = await supabase.from('categories').select('count').limit(1);
    // Ignore relations error if the tables aren't created yet, meaning connection works but schema is empty
    if (error && error.code !== '42P01') throw error;
    logger.info('✅ Supabase database connected successfully');
  } catch (err) {
    logger.error('❌ Database connection failed:', err.message);
    logger.error('Make sure your Supabase keys in .env are correct.');
  }
};

// ─── Start Server ─────────────────────────────────────────────────────────────

const startServer = async () => {
  await checkDatabaseConnection();

  const server = app.listen(PORT, () => {
    logger.info(`🚀 Ruchi Ragam API running on port ${PORT} [${env.NODE_ENV}]`);
    logger.info(`📖 Health check: http://localhost:${PORT}/health`);
  });

  // ─── Graceful Shutdown ────────────────────────────────────────────────────

  const shutdown = (signal) => {
    logger.info(`⚡ ${signal} received. Shutting down gracefully...`);
    server.close(() => {
      logger.info('💤 HTTP server closed');
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      logger.error('💀 Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // ─── Uncaught Error Handlers ──────────────────────────────────────────────  

  process.on('uncaughtException', (err) => {
    logger.error('💥 Uncaught Exception:', err);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('💥 Unhandled Rejection:', reason);
    process.exit(1);
  });

  return server;
};

startServer();
