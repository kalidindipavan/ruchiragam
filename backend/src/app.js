/**
 * @file app.js
 * @description Express application setup.
 * Configures all middleware, routes, and error handlers.
 */

require('dotenv').config();
require('express-async-errors'); // Patches express to catch async errors

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const passport = require('passport');
const path = require('path');

const env = require('./config/env');
const logger = require('./utils/logger');
const { apiLimiter } = require('./middleware/rateLimiter');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const paymentRoutes = require('./routes/payment.routes');
const reviewRoutes = require('./routes/review.routes');
const aiRoutes = require('./routes/ai.routes');
const uploadRoutes = require('./routes/upload.routes');
const userRoutes = require('./routes/user.routes');
const statsRoutes = require('./routes/stats.routes');
const couponRoutes = require('./routes/couponRoutes');

const app = express();

// ─── Security Middleware ──────────────────────────────────────────────────────

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://checkout.razorpay.com', 'https://js.stripe.com'],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
        connectSrc: ["'self'", 'https://api.stripe.com', 'https://api.razorpay.com', 'https://ruchiragam.onrender.com'],
        frameSrc: ["'self'", 'https://js.stripe.com', 'https://hooks.stripe.com'],
      },
    },
  })
);

// CORS — allow only registered origins
const allowedOrigins = [
  env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  ///\.railway\.app$/, // Allow any Railway subdomain
  /\.vercel\.app$/, // Allow any Vercel subdomain
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature', 'x-razorpay-signature'],
  })
);

// ─── Webhook Raw Body Capture (MUST be before express.json) ──────────────────

// Stripe needs raw Buffer body to verify signatures
app.use('/api/payments/stripe/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
  req.rawBody = req.body;
  next();
});

// Razorpay webhooks need raw string
app.use('/api/payments/razorpay/webhook', express.text({ type: '*/*' }), (req, res, next) => {
  req.rawBody = req.body;
  next();
});

// ─── Body Parsing ─────────────────────────────────────────────────────────────

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(env.COOKIE_SECRET));

// ─── Logging ─────────────────────────────────────────────────────────────────

app.use(
  morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev', {
    stream: { write: (msg) => logger.http(msg.trim()) },
  })
);

// ─── Passport (Google OAuth) ──────────────────────────────────────────────────

require('./config/passport'); // Configure passport strategies
app.use(passport.initialize());

// ─── Global Rate Limiter ───────────────────────────────────────────────────────

app.use('/api', apiLimiter);

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/coupons', couponRoutes);

// ─── 404 + Error Handlers ─────────────────────────────────────────────────────

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
