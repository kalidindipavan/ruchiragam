/**
 * @file returnClaimService.js
 * @description Replacement claim creation flow.
 */

const { supabase } = require('../config/db');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const emailService = require('./emailService');

/**
 * Create replacement claim.
 */
const createClaim = async (payload, user = null) => {
  const claimInsert = {
    user_id: user?.id || null,
    order_reference: payload.order_reference,
    issue_type: payload.issue_type,
    description: payload.description,
    evidence_urls: payload.evidence_urls || [],
    contact_name: payload.contact_name || user?.full_name || 'Customer',
    contact_email: payload.contact_email || user?.email,
    contact_phone: payload.contact_phone || null,
    status: 'submitted',
  };

  if (!claimInsert.contact_email) {
    throw new AppError('Contact email is required', 422);
  }

  const { data, error } = await supabase
    .from('replacement_claims')
    .insert(claimInsert)
    .select('*')
    .single();

  if (error || !data) {
    logger.error('createClaim error:', error);
    throw new AppError('Failed to submit claim', 500);
  }

  // Fire-and-forget notification for support team.
  emailService.sendReplacementClaimEmail(data, user).catch((err) => {
    logger.error(`Failed to send replacement claim email for claim ${data.id}:`, err);
  });

  return data;
};

module.exports = { createClaim };
