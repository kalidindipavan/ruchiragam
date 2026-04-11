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

/**
 * Get all coupons (Admin).
 */
const getAllCoupons = async () => {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new AppError('Failed to fetch coupons', 500);
  return data;
};

/**
 * Create a new coupon (Admin).
 */
const createCoupon = async (couponData) => {
  const { data, error } = await supabase
    .from('coupons')
    .insert([{
      ...couponData,
      code: couponData.code.toUpperCase().trim()
    }])
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') throw new AppError('Coupon code already exists', 400);
    throw new AppError('Failed to create coupon', 500);
  }
  return data;
};

/**
 * Update a coupon (Admin).
 */
const updateCoupon = async (id, couponData) => {
  const { data, error } = await supabase
    .from('coupons')
    .update({
      ...couponData,
      code: couponData.code ? couponData.code.toUpperCase().trim() : undefined
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') throw new AppError('Coupon code already exists', 400);
    throw new AppError('Failed to update coupon', 500);
  }
  return data;
};

/**
 * Delete a coupon (Admin).
 */
const deleteCoupon = async (id) => {
  const { error } = await supabase
    .from('coupons')
    .delete()
    .eq('id', id);

  if (error) throw new AppError('Failed to delete coupon', 500);
  return true;
};

module.exports = { validateCoupon, getAllCoupons, createCoupon, updateCoupon, deleteCoupon };
