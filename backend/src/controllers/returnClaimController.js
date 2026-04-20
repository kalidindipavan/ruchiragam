/**
 * @file returnClaimController.js
 * @description Controllers for replacement claims.
 */

const returnClaimService = require('../services/returnClaimService');
const { sendCreated } = require('../utils/apiResponse');

/**
 * POST /api/returns/claims
 */
const createClaim = async (req, res) => {
  const claim = await returnClaimService.createClaim(req.body, req.user);
  return sendCreated(res, claim, 'Claim submitted successfully');
};

module.exports = { createClaim };
