/**
 * @file couponService.js
 * @description Coupon validation and discount calculation.
 */

const { supabase } = require('../config/db');
const { AppError } = require('../middleware/errorHandler');

/**
 * Validate a coupon code and return discount details.
 */
const validateCoupon = async (code, subtotal) => {
  if (!code) return null;

  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single();

  if (error || !coupon) {
    throw new AppError('Invalid coupon code', 400);
  }

  // Check expiration
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    throw new AppError('Coupon has expired', 400);
  }

  // Check minimum order amount
  if (subtotal < coupon.min_order_amount) {
    throw new AppError(`Minimum order amount for this coupon is ₹${coupon.min_order_amount}`, 400);
  }

  // Calculate discount
  let discountAmount = 0;
  if (coupon.discount_type === 'percentage') {
    discountAmount = (subtotal * coupon.discount_value) / 100;
    if (coupon.max_discount && discountAmount > coupon.max_discount) {
      discountAmount = coupon.max_discount;
    }
  } else if (coupon.discount_type === 'fixed') {
    discountAmount = coupon.discount_value;
  }

  // Ensure discount doesn't exceed subtotal
  discountAmount = Math.min(discountAmount, subtotal);

  return {
    code: coupon.code,
    discountAmount: Math.round(discountAmount * 100) / 100,
    type: coupon.discount_type,
    value: coupon.discount_value
  };
};

module.exports = { validateCoupon };
