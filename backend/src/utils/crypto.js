/**
 * @file crypto.js
 * @description Cryptographic utilities for webhook signature verification
 * and other security-sensitive operations.
 */

const crypto = require('crypto');

/**
 * Verify Stripe webhook signature.
 * @param {Buffer} rawBody - Raw request body
 * @param {string} signature - Stripe-Signature header
 * @param {string} secret - Stripe webhook secret
 * @returns {boolean}
 */
const verifyStripeWebhook = (rawBody, signature, secret) => {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    stripe.webhooks.constructEvent(rawBody, signature, secret);
    return true;
  } catch {
    return false;
  }
};

/**
 * Verify Razorpay payment signature.
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Razorpay signature from client
 * @param {string} secret - Razorpay key secret
 * @returns {boolean}
 */
const verifyRazorpaySignature = (orderId, paymentId, signature, secret) => {
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  );
};

/**
 * Verify Razorpay webhook signature.
 * @param {string} rawBody - Raw request body string
 * @param {string} signature - X-Razorpay-Signature header
 * @param {string} secret - Razorpay webhook secret
 * @returns {boolean}
 */
const verifyRazorpayWebhookSignature = (rawBody, signature, secret) => {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  );
};

/**
 * Generate a secure random token.
 * @param {number} bytes - Number of bytes (default 32)
 * @returns {string} Hex string
 */
const generateSecureToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

module.exports = {
  verifyStripeWebhook,
  verifyRazorpaySignature,
  verifyRazorpayWebhookSignature,
  generateSecureToken,
};
