/**
 * @file payment.routes.js
 * Note: Webhook routes need raw body — applied before express.json() in app.js.
 */

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');
const { paymentLimiter } = require('../middleware/rateLimiter');

// User payment initiation (rate limited)
router.post('/stripe/create', authenticate, paymentLimiter, paymentController.createStripeSession);
router.post('/razorpay/create', authenticate, paymentLimiter, paymentController.createRazorpayOrder);
router.post('/razorpay/verify', authenticate, paymentController.verifyRazorpayPayment);

// Webhooks — no auth, raw body middleware applied in app.js
router.post('/stripe/webhook', paymentController.stripeWebhook);
router.post('/razorpay/webhook', paymentController.razorpayWebhook);

module.exports = router;
