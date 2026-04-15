/**
 * @file emailService.js
 * @description Service for sending transactional emails.
 * Uses Nodemailer with SMTP or a provider like Resend.
 */

const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('../utils/logger');

// Configure transporter
// If RESEND_API_KEY is available, we use Resend's SMTP
// Otherwise, we look for generic SMTP settings or fallback to console log in dev
let transporter;

if (process.env.RESEND_API_KEY) {
  transporter = nodemailer.createTransport({
    host: 'smtp.resend.com',
    port: 465,
    secure: true,
    auth: {
      user: 'resend',
      pass: process.env.RESEND_API_KEY,
    },
  });
} else if (env.NODE_ENV === 'development') {
  // Mock transporter for development
  transporter = {
    sendMail: async (options) => {
      logger.info('--- MOCK EMAIL SENT ---');
      logger.info(`To: ${options.to}`);
      logger.info(`Subject: ${options.subject}`);
      logger.info(`Body: ${options.html}`);
      logger.info('-----------------------');
      return { messageId: 'mock-id' };
    },
  };
}

/**
 * Send a password reset email.
 * @param {string} email - Targeted email
 * @param {string} resetToken - The raw token
 */
const sendPasswordResetEmail = async (email, otpCode) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Ruchi Ragam" <noreply@ruchiragam.com>',
    to: email,
    subject: 'Reset Your Password - Ruchi Ragam',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
        <h2 style="color: #f5890a;">Password Reset Request</h2>
        <p>You requested a password reset for your Ruchi Ragam account. Enter the following 6-digit code to set a new password:</p>
        <div style="margin: 30px auto; max-width: max-content; background-color: #f0f0f0; padding: 20px 40px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1a1814;">
          ${otpCode}
        </div>
        <p>If you didn't request this, you can safely ignore this email. This code will expire in 1 hour.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 12px; color: #888;">&copy; 2026 Ruchi Ragam. Authentic Indian Flavors.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Password reset email sent to ${email}: ${info.messageId}`);
  } catch (err) {
    logger.error(`Failed to send password reset email to ${email}:`, err);
    // We don't throw here to avoid leaking info to the client about email success, 
    // but in a real app you might want to handle this more robustly.
  }
};

/**
 * Send order confirmation email.
 * @param {object} order - Order object with items populated
 * @param {object} user - User object with email, full_name
 */
const sendOrderConfirmationEmail = async (order, user) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Ruchi Ragam" <noreply@ruchiragam.com>',
    to: user.email,
    subject: `Order #${order.id.slice(-8).toUpperCase()} Confirmed - Thank You!`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #f5890a 0%, #ff8c00 100%); color: white; padding: 2rem; text-align: center; }
    .order-details { background: #f8f9fa; padding: 2rem; border-radius: 12px; margin: 2rem 0; }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
    th { background: #f8f9fa; font-weight: 600; }
    .total { font-size: 1.2em; font-weight: bold; color: #f5890a; }
    .address { background: white; padding: 1.5rem; border-left: 4px solid #f5890a; margin: 1rem 0; }
    .footer { text-align: center; padding: 2rem; color: #666; font-size: 0.9em; }
    @media (max-width: 600px) { body { padding: 1rem; } table { font-size: 0.9em; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>🍛 Order Confirmed!</h1>
    <p>Thank you for your order, ${user.full_name || 'Customer'}!</p>
  </div>
  
  <div style="padding: 0 2rem;">
    <h2>Order #${order.id.slice(-8).toUpperCase()} | ${new Date(order.created_at).toLocaleDateString('en-IN')}</h2>
    
    <div class="order-details">
      <h3>Your Order Items</h3>
      <table>
        <thead>
          <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
        </thead>
        <tbody>
          ${order.items.map(item => `
            <tr>
              <td><strong>${item.product_name}</strong>${item.variant_name ? `<br><small>${item.variant_name}</small>` : ''}</td>
              <td>${item.quantity}</td>
              <td>₹${item.unit_price.toLocaleString()}</td>
              <td class="total">₹${item.total_price.toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 2px solid #f0f0f0;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
          <span>Subtotal:</span> <span>₹${order.subtotal.toLocaleString()}</span>
        </div>
        ${order.discount_amount > 0 ? `<div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; color: green;">
          <span>Discount ${order.coupon_code ? `(${order.coupon_code})` : ''}:</span> <span>-₹${order.discount_amount.toLocaleString()}</span>
        </div>` : ''}
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
          <span>Delivery:</span> <span>₹${order.delivery_fee.toLocaleString()}</span>
        </div>
        <div class="total" style="display: flex; justify-content: space-between; font-size: 1.3em;">
          <span>Total:</span> <strong>₹${order.total.toLocaleString()}</strong>
        </div>
      </div>
    </div>
    
    ${order.special_instructions ? `
    <div class="order-details">
      <h3>Special Instructions</h3>
      <p>${order.special_instructions}</p>
    </div>
    ` : ''}
    
    <div class="address">
      <h3>📍 Delivery Address</h3>
      <p>${order.delivery_address}</p>
    </div>
    
    <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 1.5rem; border-radius: 8px; margin: 2rem 0;">
      <h3>Next Steps</h3>
      <p><strong>${order.payment_provider.toUpperCase()} Payment</strong><br>
      ${order.payment_status === 'completed' ? '✅ Payment received successfully!' : 'Payment pending confirmation.'}</p>
      <p>You will receive tracking updates via SMS/Email. Expected delivery: 3-5 business days.</p>
    </div>
    
    <div class="footer">
      <p>Need help? <a href="${env.CLIENT_URL || 'https://ruchiragam.com'}/support" style="color: #f5890a;">Contact Support</a> | 
      <a href="${env.CLIENT_URL || 'https://ruchiragam.com'}/track" style="color: #f5890a;">Track Order</a></p>
      <p>&copy; 2026 Ruchi Ragam. Authentic Pachadi & Podi since generations. 🇮🇳</p>
    </div>
  </div>
</body>
</html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Order confirmation sent to ${user.email} for order ${order.id}: ${info.messageId}`);
  } catch (err) {
    logger.error(`Failed to send order confirmation to ${user.email}:`, err);
    // Fire-and-forget: don't block order flow
  }
};

module.exports = { 
  sendPasswordResetEmail, 
  sendOrderConfirmationEmail 
};
