/**
 * @file couponController.js
 * @description Coupon validation endpoints.
 */

const couponService = require('../services/couponService');
const { sendSuccess } = require('../utils/apiResponse');
const { AppError } = require('../middleware/errorHandler');

/**
 * Validate coupon code.
 * POST /api/coupons/validate
 */
const validateCoupon = async (req, res) => {
  const { code, subtotal } = req.body;

  if (!code || !subtotal) {
    throw new AppError('Code and subtotal are required', 400);
  }

  const result = await couponService.validateCoupon(code, subtotal);

  return sendSuccess(res, result, 'Coupon validated successfully');
};

module.exports = { validateCoupon };
