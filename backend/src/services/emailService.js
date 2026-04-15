/**
 * @file emailService.js
 * @description Service for sending transactional emails.
 * Uses Nodemailer with SMTP or a provider like Resend.
 */

const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('../utils/logger');

const hasRealValue = (value) => {
  if (!value) return false;
  const v = String(value).trim();
  if (!v) return false;
  const lower = v.toLowerCase();
  return !(
    lower.includes('your-') ||
    lower.includes('example') ||
    lower.includes('placeholder') ||
    lower === 'changeme'
  );
};

// Configure transporter
// If RESEND_API_KEY is available, we use Resend's SMTP
// Otherwise, we look for generic SMTP settings or fallback to console log in dev
const getTransporters = () => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const gmailUser = (process.env.GMAIL_EMAIL || process.env.EMAIL_USER || '').trim();
  const gmailPass = (process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS || '').trim();
  const transporters = [];

  // Gmail SMTP (recommended)
  if (hasRealValue(gmailUser) && hasRealValue(gmailPass)) {
    transporters.push({
      name: 'gmail',
      transporter: nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
      }),
    });
  }

  // Resend fallback
  if (hasRealValue(process.env.RESEND_API_KEY)) {
    transporters.push({
      name: 'resend',
      transporter: nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
      auth: {
        user: 'resend',
        pass: process.env.RESEND_API_KEY,
      },
      }),
    });
  }

  // Generic SMTP fallback
  if (hasRealValue(process.env.SMTP_HOST) && hasRealValue(process.env.SMTP_USER) && hasRealValue(process.env.SMTP_PASS)) {
    transporters.push({
      name: 'smtp',
      transporter: nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      secure: process.env.SMTP_SECURE === 'true',
      }),
    });
  }

  if (transporters.length > 0) {
    logger.info(`Email providers configured: ${transporters.map((t) => t.name).join(', ')}`);
    return transporters;
  }

  if (nodeEnv === 'development') {
    // Mock only when no email credentials are configured
    return [{
      name: 'mock',
      transporter: {
        sendMail: async (options) => {
        logger.info('--- MOCK EMAIL SENT ---');
        logger.info(`To: ${options.to}`);
        logger.info(`Subject: ${options.subject}`);
        logger.info(`Body preview: ${options.html ? options.html.substring(0, 300) + '...' : options.text ? options.text.substring(0, 300) + '...' : 'No body'}`);
        logger.info('-----------------------');
        return { messageId: 'mock-' + Date.now() };
      },
      },
    }];
  }

  throw new Error('Email config missing. See backend/.env.example for Gmail/Resend/SMTP setup');
};


// Update send functions to use getTransporter()
let cachedTransporters = null;

const getCachedTransporters = () => {
  if (!cachedTransporters) {
    cachedTransporters = getTransporters();
  }
  return cachedTransporters;
};

const sendWithFallback = async (mailOptions) => {
  const providers = getCachedTransporters();
  let lastError = null;

  for (const provider of providers) {
    try {
      const info = await provider.transporter.sendMail(mailOptions);
      return { provider: provider.name, info };
    } catch (err) {
      lastError = err;
      logger.error(`Email send failed via ${provider.name}:`, err);
    }
  }

  throw lastError || new Error('All configured email providers failed');
};

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
    const { provider, info } = await sendWithFallback(mailOptions);
    logger.info(`Password reset email sent to ${email} via ${provider}: ${info.messageId}`);
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
  const orderCode = (order.id || '').slice(-8).toUpperCase();
  const orderDate = order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN');
  const items = Array.isArray(order.items) ? order.items : (Array.isArray(order.order_items) ? order.order_items : []);
  const formatINR = (value) => `&#8377;${Number(value || 0).toLocaleString('en-IN')}`;
  const customerName = user.full_name || 'Customer';
  const paymentProvider = (order.payment_provider || 'online').toUpperCase();
  const paymentMessage = order.payment_status === 'completed' ? 'Payment received successfully.' : 'Payment is pending confirmation.';
  const formatAddress = (address) => {
    if (!address) return 'Address not available';
    if (typeof address === 'string') return address;

    if (typeof address === 'object') {
      const structured = [
        address.full_name || address.name,
        address.phone,
        address.address_line1 || address.line1,
        address.address_line2 || address.line2,
        address.landmark,
        address.city,
        address.state,
        address.postal_code || address.pincode,
        address.country,
      ].filter(Boolean);

      if (structured.length) return structured.join(', ');

      const flatValues = Object.values(address)
        .filter((value) => value !== null && value !== undefined && typeof value !== 'object')
        .map((value) => String(value).trim())
        .filter(Boolean);

      return flatValues.length ? flatValues.join(', ') : 'Address not available';
    }

    return String(address);
  };
  const deliveryAddress = formatAddress(order.delivery_address);

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Ruchi Ragam" <noreply@ruchiragam.com>',
    to: user.email,
    subject: `Order #${orderCode} Confirmed - Thank You!`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; background: #fff8ef; font-family: Arial, sans-serif; color: #2b2b2b; }
    .wrapper { width: 100%; padding: 24px 0; }
    .card { max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #f1e6d8; border-radius: 14px; overflow: hidden; }
    .header { background: linear-gradient(120deg, #e6721f, #f5a623); color: #ffffff; padding: 28px 24px; text-align: center; }
    .brand { font-size: 22px; font-weight: 700; margin: 0 0 8px 0; letter-spacing: 0.3px; }
    .sub { margin: 0; font-size: 15px; opacity: 0.95; }
    .content { padding: 24px; }
    .meta { background: #fff4e8; border: 1px solid #f3dfc9; border-radius: 10px; padding: 14px; margin-bottom: 18px; font-size: 14px; }
    .meta-row { margin: 3px 0; }
    .section-title { margin: 0 0 10px 0; font-size: 17px; color: #a14e11; }
    table { width: 100%; border-collapse: collapse; margin: 0; }
    th { text-align: left; font-size: 13px; color: #7a5a42; background: #fff8ef; padding: 10px 8px; border-bottom: 1px solid #f0e1d0; }
    td { padding: 10px 8px; border-bottom: 1px solid #f7ecdf; vertical-align: top; font-size: 14px; }
    .summary { margin-top: 14px; border-top: 2px solid #f3e3d0; padding-top: 12px; }
    .summary-row { display: flex; justify-content: space-between; font-size: 14px; margin: 6px 0; }
    .discount { color: #0f8a4b; }
    .grand-total { font-size: 18px; color: #cf5f17; font-weight: 700; }
    .box { background: #fffaf4; border: 1px solid #f3e5d4; border-radius: 10px; padding: 14px; margin-top: 16px; }
    .footer { text-align: center; font-size: 12px; color: #8b7867; padding: 0 24px 24px 24px; }
    .link { color: #c85f1d; text-decoration: none; }
    @media (max-width: 620px) {
      .wrapper { padding: 12px 8px; }
      .content { padding: 16px; }
      th, td { font-size: 13px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <p class="brand">Ruchi Ragam</p>
        <p class="sub">Your order is confirmed, ${customerName}.</p>
      </div>
      <div class="content">
        <div class="meta">
          <p class="meta-row"><strong>Order ID:</strong> #${orderCode}</p>
          <p class="meta-row"><strong>Date:</strong> ${orderDate}</p>
          <p class="meta-row"><strong>Payment:</strong> ${paymentProvider} - ${paymentMessage}</p>
        </div>

        <h3 class="section-title">Order Items</h3>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item) => `
              <tr>
                <td><strong>${item.product_name || 'Item'}</strong>${item.variant_name ? `<br><span style="font-size:12px;color:#7f6a58;">${item.variant_name}</span>` : ''}</td>
                <td>${item.quantity || 0}</td>
                <td>${formatINR(item.unit_price)}</td>
                <td><strong>${formatINR(item.total_price)}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="summary">
          <div class="summary-row"><span>Subtotal</span><span>${formatINR(order.subtotal)}</span></div>
          ${Number(order.discount_amount || 0) > 0 ? `<div class="summary-row discount"><span>Discount ${order.coupon_code ? `(${order.coupon_code})` : ''}</span><span>-${formatINR(order.discount_amount)}</span></div>` : ''}
          <div class="summary-row"><span>Delivery</span><span>${formatINR(order.delivery_fee)}</span></div>
          <div class="summary-row grand-total"><span>Total</span><span>${formatINR(order.total)}</span></div>
        </div>

        ${order.special_instructions ? `<div class="box"><strong>Special Instructions</strong><p style="margin:8px 0 0 0;">${order.special_instructions}</p></div>` : ''}
        <div class="box"><strong>Delivery Address</strong><p style="margin:8px 0 0 0;">${deliveryAddress}</p></div>
        <div class="box"><strong>Need help?</strong> Visit <a class="link" href="${env.CLIENT_URL || 'https://ruchiragam.com'}/support">Support</a> or <a class="link" href="${env.CLIENT_URL || 'https://ruchiragam.com'}/track">Track Order</a>.</div>
      </div>

      <div class="footer">
        <p style="margin:0;">&copy; 2026 Ruchi Ragam. Authentic Indian flavors.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `,
  };

  try {
    const { provider, info } = await sendWithFallback(mailOptions);
    logger.info(`Order confirmation sent to ${user.email} for order ${order.id} via ${provider}: ${info.messageId}`);
  } catch (err) {
    logger.error(`Failed to send order confirmation to ${user.email}:`, err);
    // Fire-and-forget: don't block order flow
  }
};

module.exports = { 
  sendPasswordResetEmail, 
  sendOrderConfirmationEmail 
};
