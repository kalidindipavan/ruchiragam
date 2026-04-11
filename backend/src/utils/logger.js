/**
 * @file logger.js
 * @description Winston logger with file rotation and structured JSON logs in production.
 */

const { createLogger, format, transports } = require('winston');
const path = require('path');

const { combine, timestamp, errors, json, colorize, printf } = format;

const devFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  })
);

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  transports: [
    new transports.Console(),
    ...(process.env.NODE_ENV === 'production'
      ? [
          new transports.File({ filename: path.join('logs', 'error.log'), level: 'error' }),
          new transports.File({ filename: path.join('logs', 'combined.log') }),
        ]
      : []),
  ],
  exceptionHandlers: [
    new transports.Console(),
  ],
});

module.exports = logger;
