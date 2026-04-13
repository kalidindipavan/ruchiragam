/**
 * @file env.js
 * @description Validates all environment variables at startup using Zod.
 * Throws an error immediately if required vars are missing.
 */

const { z } = require('zod');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('5000'),

  // Supabase
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_ANON_KEY: z.string().min(1),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_CALLBACK_URL: z.string().url(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  STRIPE_PUBLISHABLE_KEY: z.string().min(1),

  // Razorpay
  RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1),
  RAZORPAY_WEBHOOK_URL: z.string().url().optional(),
  RAZORPAY_WEBSITE_URL: z.string().url().optional(),

  // OpenAI
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_MODEL: z.string().default('gpt-4o'),

  // App
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  API_BASE_URL: z.string().url().default('http://localhost:5000'),
  COOKIE_SECRET: z.string().min(32),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
});

let env;
try {
  env = envSchema.parse(process.env);
} catch (err) {
  if (process.env.NODE_ENV === 'test') {
    console.warn('⚠️  Some environment variables are missing or invalid in TEST mode. Tests may fail if they rely on these vars.');
    env = envSchema.partial().parse(process.env); // Fallback to partial if in test
  } else {
    console.error('❌ Invalid environment variables:', err.flatten().fieldErrors);
    process.exit(1);
  }
}

module.exports = env;
