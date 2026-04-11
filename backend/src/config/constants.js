/**
 * @file constants.js
 * @description App-wide constants.
 */

module.exports = {
  // Roles
  ROLES: {
    ADMIN: 'admin',
    USER: 'user',
    SELLER: 'seller',
  },

  // Order statuses
  ORDER_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PREPARING: 'preparing',
    OUT_FOR_DELIVERY: 'out_for_delivery',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded',
  },

  // Payment statuses
  PAYMENT_STATUS: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded',
  },

  // Payment providers
  PAYMENT_PROVIDER: {
    STRIPE: 'stripe',
    RAZORPAY: 'razorpay',
  },

  // Product statuses
  PRODUCT_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    OUT_OF_STOCK: 'out_of_stock',
  },

  // Rate limiting windows (ms)
  RATE_LIMITS: {
    AUTH: { windowMs: 15 * 60 * 1000, max: 10 },        // 10 login attempts per 15 min
    API: { windowMs: 15 * 60 * 1000, max: 200 },          // 200 req/15min general
    AI: { windowMs: 60 * 1000, max: 20 },                  // 20 AI req/min
    PAYMENT: { windowMs: 60 * 1000, max: 10 },             // 10 payment initiations/min
  },

  // Account lockout
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 15,

  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};
