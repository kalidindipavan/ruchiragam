/**
 * @file stripeService.js
 * @description Stripe payment integration.
 * Creates checkout sessions, handles webhooks, and manages refunds.
 */

const Stripe = require('stripe');
const env = require('../config/env');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

/**
 * Create a Stripe Checkout Session for an order.
 * @param {object} order - Order from DB (with items)
 * @param {object} user - Authenticated user
 * @returns {object} { sessionId, sessionUrl, publishableKey }
 */
const createCheckoutSession = async (order, user) => {
  try {
    const lineItems = order.items.map((item) => ({
      price_data: {
        currency: 'inr',
        product_data: {
          name: item.product_name,
          images: item.product_image ? [item.product_image] : [],
          metadata: { product_id: item.product_id },
        },
        unit_amount: Math.round(item.unit_price * 100), // Stripe uses paise
      },
      quantity: item.quantity,
    }));

    // Add delivery fee as line item if applicable
    if (order.delivery_fee > 0) {
      lineItems.push({
        price_data: {
          currency: 'inr',
          product_data: { name: 'Delivery Fee' },
          unit_amount: Math.round(order.delivery_fee * 100),
        },
        quantity: 1,
      });
    }

    // Add tax as line item
    if (order.tax > 0) {
      lineItems.push({
        price_data: {
          currency: 'inr',
          product_data: { name: 'GST (5%)' },
          unit_amount: Math.round(order.tax * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: user.email,
      client_reference_id: order.id,
      metadata: {
        order_id: order.id,
        user_id: user.id,
      },
      success_url: `${env.CLIENT_URL}/orders/${order.id}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.CLIENT_URL}/checkout?payment=cancelled&order_id=${order.id}`,
      payment_intent_data: {
        metadata: { order_id: order.id },
      },
    });

    logger.info(`Stripe session created: ${session.id} for order: ${order.id}`);

    return {
      sessionId: session.id,
      sessionUrl: session.url,
      publishableKey: env.STRIPE_PUBLISHABLE_KEY,
    };
  } catch (err) {
    logger.error('Stripe createCheckoutSession error:', err);
    throw new AppError(`Payment initialization failed: ${err.message}`, 400);
  }
};

/**
 * Process a Stripe webhook event.
 * @param {Buffer} rawBody - Raw request body
 * @param {string} signature - Stripe-Signature header
 * @returns {{ event, orderId, status }}
 */
const handleWebhook = (rawBody, signature) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    throw new AppError(`Webhook signature verification failed: ${err.message}`, 400);
  }

  const result = { event: event.type, orderId: null, status: null };

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      result.orderId = session.metadata.order_id;
      result.status = 'completed';
      result.paymentIntentId = session.payment_intent;
      break;
    }
    case 'payment_intent.payment_failed': {
      const intent = event.data.object;
      result.orderId = intent.metadata.order_id;
      result.status = 'failed';
      break;
    }
    case 'charge.refunded': {
      const charge = event.data.object;
      result.orderId = charge.metadata?.order_id;
      result.status = 'refunded';
      break;
    }
    default:
      logger.info(`Unhandled Stripe event: ${event.type}`);
  }

  return result;
};

/**
 * Create a refund for an order.
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @param {number} amount - Amount in INR (optional, full refund if omitted)
 */
const createRefund = async (paymentIntentId, amount = null) => {
  try {
    const refundData = { payment_intent: paymentIntentId };
    if (amount) refundData.amount = Math.round(amount * 100);

    const refund = await stripe.refunds.create(refundData);
    return refund;
  } catch (err) {
    throw new AppError(`Refund failed: ${err.message}`, 400);
  }
};

module.exports = { createCheckoutSession, handleWebhook, createRefund };
