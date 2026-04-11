/**
 * @file paymentController.js
 * @description Payment endpoints for Stripe and Razorpay.
 */

const paymentService = require('../services/paymentService');
const { sendSuccess } = require('../utils/apiResponse');
const { AppError } = require('../middleware/errorHandler');

/**
 * POST /api/payments/stripe/create — Initiate Stripe checkout session.
 */
const createStripeSession = async (req, res) => {
  const { order_id } = req.body;
  if (!order_id) throw new AppError('order_id is required', 400);

  const data = await paymentService.initiatePayment(order_id, 'stripe', req.user);
  return sendSuccess(res, data, 'Stripe session created');
};

/**
 * POST /api/payments/razorpay/create — Initiate Razorpay order.
 */
const createRazorpayOrder = async (req, res) => {
  const { order_id } = req.body;
  if (!order_id) throw new AppError('order_id is required', 400);

  const data = await paymentService.initiatePayment(order_id, 'razorpay', req.user);
  return sendSuccess(res, data, 'Razorpay order created');
};

/**
 * POST /api/payments/stripe/webhook — Stripe webhook handler.
 * Raw body required — configured before body-parser in app.js.
 */
const stripeWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  await paymentService.handleStripeWebhook(req.rawBody, signature);
  return res.json({ received: true });
};

/**
 * POST /api/payments/razorpay/webhook — Razorpay webhook handler.
 */
const razorpayWebhook = async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  await paymentService.handleRazorpayWebhook(req.rawBody, signature);
  return res.json({ received: true });
};

/**
 * POST /api/payments/razorpay/verify — Client-side Razorpay payment verification.
 * Called after user completes payment in Razorpay widget.
 */
const verifyRazorpayPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;

  const result = await paymentService.verifyRazorpayPayment(
    {
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      orderId: order_id,
    },
    req.user
  );

  return sendSuccess(res, result, 'Payment verified successfully');
};

module.exports = {
  createStripeSession,
  createRazorpayOrder,
  stripeWebhook,
  razorpayWebhook,
  verifyRazorpayPayment,
};
