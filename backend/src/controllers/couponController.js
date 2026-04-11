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

/**
 * Get all coupons.
 * GET /api/coupons
 */
const getAllCoupons = async (req, res) => {
  const coupons = await couponService.getAllCoupons();
  return sendSuccess(res, coupons, 'Coupons fetched successfully');
};

/**
 * Create a new coupon.
 * POST /api/coupons
 */
const createCoupon = async (req, res) => {
  const coupon = await couponService.createCoupon(req.body);
  return sendSuccess(res, coupon, 'Coupon created successfully');
};

/**
 * Update a coupon.
 * PATCH /api/coupons/:id
 */
const updateCoupon = async (req, res) => {
  const coupon = await couponService.updateCoupon(req.params.id, req.body);
  return sendSuccess(res, coupon, 'Coupon updated successfully');
};

/**
 * Delete a coupon.
 * DELETE /api/coupons/:id
 */
const deleteCoupon = async (req, res) => {
  await couponService.deleteCoupon(req.params.id);
  return sendSuccess(res, null, 'Coupon deleted successfully');
};

module.exports = { 
  validateCoupon, 
  getAllCoupons, 
  createCoupon, 
  updateCoupon, 
  deleteCoupon 
};
