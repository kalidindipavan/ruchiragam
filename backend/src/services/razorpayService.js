/**
 * @file razorpayService.js
 * @description Razorpay payment integration for Indian market.
 * Handles order creation, payment verification, webhooks, and refunds.
 */

const Razorpay = require('razorpay');
const env = require('../config/env');
const { AppError } = require('../middleware/errorHandler');
const { verifyRazorpaySignature, verifyRazorpayWebhookSignature } = require('../utils/crypto');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

/**
 * Create a Razorpay order.
 * @param {object} order - Order from DB
 * @param {object} user - Authenticated user
 * @returns {{ razorpayOrderId, amount, currency, keyId }}
 */
const createOrder = async (order, user) => {
  try {
    if (!order || !order.total) {
      throw new Error('Order total is missing or zero');
    }

    const total = Number(order.total);
    if (isNaN(total) || total <= 0) {
      throw new Error(`Invalid order total: ${order.total}`);
    }

    const amountInPaise = Math.round(total * 100);

    // Razorpay minimum amount is 100 paise (1 INR)
    if (amountInPaise < 100) {
      throw new Error(`Order amount ${total} is below the minimum required by Razorpay (1.00 INR)`);
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: order.id.toString().substring(0, 40), // Receipt max 40 chars
      notes: {
        order_id: order.id,
        user_id: user.id,
        user_email: user.email,
      },
    });

    logger.info(`Razorpay order created: ${razorpayOrder.id} for order: ${order.id}`);

    return {
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: env.RAZORPAY_KEY_ID,
      prefill: {
        name: user.full_name || 'Guest',
        email: user.email,
        contact: user.phone || '',
      },
    };
  } catch (err) {
    logger.error('Razorpay createOrder error details:', {
      message: err.message,
      code: err.code,
      description: err.description,
      metadata: err.metadata,
      orderId: order?.id
    });
    
    const errorMsg = err.description || err.message || 'Unknown Razorpay error';
    throw new AppError(`Payment initialization failed: ${errorMsg}`, 400);
  }
};

/**
 * Verify Razorpay payment signature (client-side callback verification).
 * Called after user completes payment in Razorpay widget.
 * @param {string} razorpayOrderId
 * @param {string} razorpayPaymentId
 * @param {string} razorpaySignature
 * @returns {{ verified: boolean }}
 */
const verifyPayment = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  const isValid = verifyRazorpaySignature(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    env.RAZORPAY_KEY_SECRET
  );

  if (!isValid) {
    throw new AppError('Payment verification failed: invalid signature', 400);
  }

  return { verified: true, paymentId: razorpayPaymentId };
};

/**
 * Process a Razorpay webhook event.
 * @param {string} rawBody - Raw request body string
 * @param {string} signature - X-Razorpay-Signature header
 * @returns {{ event, orderId, status, paymentId }}
 */
const handleWebhook = (rawBody, signature) => {
  const isValid = verifyRazorpayWebhookSignature(
    rawBody,
    signature,
    env.RAZORPAY_WEBHOOK_SECRET
  );

  if (!isValid) {
    throw new AppError('Razorpay webhook signature invalid', 400);
  }

  const payload = JSON.parse(rawBody);
  const result = { event: payload.event, orderId: null, status: null, paymentId: null };

  switch (payload.event) {
    case 'payment.captured': {
      const payment = payload.payload.payment.entity;
      result.orderId = payment.notes?.order_id;
      result.paymentId = payment.id;
      result.status = 'completed';
      break;
    }
    case 'payment.failed': {
      const payment = payload.payload.payment.entity;
      result.orderId = payment.notes?.order_id;
      result.paymentId = payment.id;
      result.status = 'failed';
      break;
    }
    case 'refund.processed': {
      const refund = payload.payload.refund.entity;
      result.orderId = refund.notes?.order_id;
      result.status = 'refunded';
      break;
    }
    default:
      logger.info(`Unhandled Razorpay event: ${payload.event}`);
  }

  return result;
};

/**
 * Initiate a Razorpay refund.
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} amount - Amount in INR
 */
const createRefund = async (paymentId, amount) => {
  try {
    const refund = await razorpay.payments.refund(paymentId, {
      amount: Math.round(amount * 100),
      notes: { reason: 'Order cancelled/refund requested' },
    });
    return refund;
  } catch (err) {
    throw new AppError(`Refund failed: ${err.message}`, 400);
  }
};

module.exports = { createOrder, verifyPayment, handleWebhook, createRefund };
