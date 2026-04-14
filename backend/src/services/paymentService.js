/**
 * @file paymentService.js
 * @description Payment provider abstraction layer.
 * Dynamically selects Stripe or Razorpay based on user preference.
 * Records payment transactions in DB. Handles idempotency.
 */

const { supabase } = require('../config/db');
const stripeService = require('./stripeService');
const razorpayService = require('./razorpayService');
const orderService = require('./orderService');
const { AppError } = require('../middleware/errorHandler');
const { PAYMENT_PROVIDER, PAYMENT_STATUS } = require('../config/constants');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

/**
 * Initiate payment for an order.
 * Dynamically delegates to Stripe or Razorpay.
 * @param {string} orderId - Our DB order ID
 * @param {string} provider - 'stripe' | 'razorpay'
 * @param {object} user - Authenticated user
 */
const initiatePayment = async (orderId, provider, user) => {
  logger.info(`Initiating ${provider} payment for order ${orderId} by user ${user.id}`);
  const order = await orderService.getOrderById(orderId, user.id, user.role);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.payment_status === 'completed') {
    throw new AppError('Order already paid', 409);
  }

  if (Number(order.total) <= 0) {
    throw new AppError('Order total is zero. No online payment is required for this order.', 400);
  }

  // Check for existing pending payment (idempotency)
  const { data: existing } = await supabase
    .from('payments')
    .select('*')
    .eq('order_id', orderId)
    .eq('status', PAYMENT_STATUS.PENDING)
    .eq('provider', provider)
    .single();

  if (existing) {
    return existing.provider_data;
  }

  let paymentData;

  if (provider === PAYMENT_PROVIDER.STRIPE) {
    paymentData = await stripeService.createCheckoutSession(order, user);
  } else if (provider === PAYMENT_PROVIDER.RAZORPAY) {
    paymentData = await razorpayService.createOrder(order, user);
  } else {
    throw new AppError('Invalid payment provider', 400);
  }

  // Record payment in DB
  await supabase.from('payments').insert({
    id: uuidv4(),
    order_id: orderId,
    user_id: user.id,
    provider,
    status: PAYMENT_STATUS.PENDING,
    amount: order.total,
    currency: 'INR',
    provider_data: paymentData,
  });

  return paymentData;
};

/**
 * Handle Stripe webhook — update payment + order status.
 */
const handleStripeWebhook = async (rawBody, signature) => {
  const result = stripeService.handleWebhook(rawBody, signature);

  if (!result.orderId) return;

  await _updatePaymentRecord(result.orderId, PAYMENT_PROVIDER.STRIPE, result.status, result.paymentIntentId);

  if (result.status === 'completed') {
    await orderService.markOrderPaid(result.orderId, result.paymentIntentId);
  }

  logger.info(`Stripe webhook processed: ${result.event} for order ${result.orderId}`);
};

/**
 * Handle Razorpay webhook — update payment + order status.
 */
const handleRazorpayWebhook = async (rawBody, signature) => {
  const result = razorpayService.handleWebhook(rawBody, signature);

  if (!result.orderId) return;

  await _updatePaymentRecord(result.orderId, PAYMENT_PROVIDER.RAZORPAY, result.status, result.paymentId);

  if (result.status === 'completed') {
    await orderService.markOrderPaid(result.orderId, result.paymentId);
  }

  logger.info(`Razorpay webhook processed: ${result.event} for order ${result.orderId}`);
};

/**
 * Verify Razorpay payment client-side callback.
 */
const verifyRazorpayPayment = async ({ razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId }, user) => {
  const result = razorpayService.verifyPayment(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  );

  await _updatePaymentRecord(orderId, PAYMENT_PROVIDER.RAZORPAY, 'completed', razorpayPaymentId);
  const order = await orderService.markOrderPaid(orderId, razorpayPaymentId);

  return { verified: true, order };
};

// ─── Private ──────────────────────────────────────────────────────────────────

const _updatePaymentRecord = async (orderId, provider, status, providerPaymentId) => {
  await supabase
    .from('payments')
    .update({
      status,
      provider_payment_id: providerPaymentId,
      completed_at: status === 'completed' ? new Date().toISOString() : null,
    })
    .eq('order_id', orderId)
    .eq('provider', provider);
};

module.exports = { initiatePayment, handleStripeWebhook, handleRazorpayWebhook, verifyRazorpayPayment };
