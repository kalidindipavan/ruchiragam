/**
 * @file validate.js
 * @description Zod-based request validation middleware.
 * Validates req.body, req.query, and req.params against a Zod schema.
 */

const { z } = require('zod');
const { sendError } = require('../utils/apiResponse');

/**
 * validate — Creates an Express middleware that validates the request using a Zod schema.
 * @param {object} schema - Object with { body?, query?, params? } Zod schemas
 * @returns {Function} Express middleware
 */
const validate = (schema) => {
  return (req, res, next) => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        if (!err.issues) {
          console.error('[validate.js] ZodError missing .issues:', err);
          return sendError(res, 'Validation failed (Unknown structure)', 422);
        }
        const errors = err.issues.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return sendError(res, 'Validation failed', 422, errors);
      }
      console.error('[validate.js] Non-Zod validation crash:', err);
      return sendError(res, 'Invalid request data', 400);
    }
  };
};

// ─── Common Schemas ───────────────────────────────────────────────────────────

const schemas = {
  // Auth
  register: {
    body: z.object({
      full_name: z.string().min(2).max(100),
      email: z.string().email(),
      password: z
        .string()
        .min(8)
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, {
          message: 'Password must have uppercase, lowercase, number, and special character',
        }),
      phone: z.string().optional(),
    }),
  },

  login: {
    body: z.object({
      email: z.string().email(),
      password: z.string().min(1),
    }),
  },
  forgotPassword: {
    body: z.object({
      email: z.string().email(),
    }),
  },
  resetPassword: {
    body: z.object({
      email: z.string().email(),
      otp: z.string().length(6, 'OTP must be exactly 6 digits'),
      password: z
        .string()
        .min(8)
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, {
          message: 'Password must have uppercase, lowercase, number, and special character',
        }),
    }),
  },

  // Products
  createProduct: {
    body: z.object({
      name: z.string().min(2).max(200),
      description: z.string().min(10),
      price: z.number().positive(),
      category_id: z.string().uuid(),
      image_url: z.string().url().optional(),
      is_vegetarian: z.boolean().default(true),
      is_vegan: z.boolean().default(false),
      is_gluten_free: z.boolean().default(false),
      is_spicy: z.boolean().default(false),
      spice_level: z.number().min(0).max(5).default(0),
      preparation_time_minutes: z.number().positive().default(30),
      tags: z.array(z.string()).default([]),
      available_days: z.array(z.string()).default([]),
      max_orders_per_day: z.number().positive().optional(),
    }),
  },

  // Orders
  createOrder: {
    body: z.object({
      delivery_address: z.object({
        street: z.string().min(5),
        city: z.string().min(2),
        state: z.string().min(2),
        postal_code: z.string().min(4),
        country: z.string().default('India'),
        phone: z.string().min(10, 'Valid phone number is required'),
      }),
      payment_provider: z.enum(['stripe', 'razorpay', 'cod']),
      special_instructions: z.string().max(500).optional(),
      coupon_code: z.string().trim().min(1).max(50).optional(),
    }),
  },

  // Reviews
  createReview: {
    body: z.object({
      product_id: z.string().uuid(),
      rating: z.number().min(1).max(5),
      comment: z.string().max(1000).optional(),
    }),
  },

  // AI
  aiSearch: {
    body: z.object({
      query: z.string().min(1).max(500),
    }),
  },

  generateDescription: {
    body: z.object({
      name: z.string().min(2),
      category: z.string().min(2),
      ingredients: z.array(z.string()).optional(),
      taste_profile: z.string().optional(),
    }),
  },

  // Pagination
  pagination: {
    query: z.object({
      page: z.coerce.number().positive().default(1),
      limit: z.coerce.number().positive().max(100).default(20),
      sort: z.string().optional(),
      order: z.enum(['asc', 'desc']).default('desc'),
    }),
  },
};

module.exports = { validate, schemas };
