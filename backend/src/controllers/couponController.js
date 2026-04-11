/**
 * @file couponController.js
 * @description Coupon validation endpoints.
 */

const couponService = require('../services/couponService');
const { catchAsync } = require('../utils/catchAsync');

/**
 * Validate coupon code.
 * POST /api/coupons/validate
 */
const validateCoupon = catchAsync(async (req, res) => {
  const { code, subtotal } = req.body;

  if (!code || !subtotal) {
    return res.status(400).json({
      status: 'error',
      message: 'Code and subtotal are required'
    });
  }

  const result = await couponService.validateCoupon(code, subtotal);

  res.status(200).json({
    status: 'success',
    data: result
  });
});

module.exports = { validateCoupon };
