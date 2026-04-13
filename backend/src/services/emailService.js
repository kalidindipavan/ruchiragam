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
const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${env.CLIENT_URL}/auth/reset?token=${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Ruchi Ragam" <noreply@ruchiragam.com>',
    to: email,
    subject: 'Reset Your Password - Ruchi Ragam',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f5890a;">Password Reset Request</h2>
        <p>You requested a password reset for your Ruchi Ragam account. Click the button below to set a new password:</p>
        <div style="margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #f5890a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
        </div>
        <p>If you didn't request this, you can safely ignore this email. This link will expire in 1 hour.</p>
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

module.exports = { sendPasswordResetEmail };
