/**
 * @file variantService.js
 * @description Variant CRUD operations.
 */

const { supabase } = require('../config/db');
const { AppError } = require('../middleware/errorHandler');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

/**
 * Create multiple variants for a product.
 */
const createVariants = async (productId, variants) => {
  if (!variants || variants.length === 0) {
    throw new AppError('At least one variant required', 400);
  }

  // Verify product exists
  const { data: product } = await supabase
    .from('products')
    .select('id')
    .eq('id', productId)
    .single();

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const variantsData = variants.map(v => ({
    id: uuidv4(),
    product_id: productId,
    name: v.name,
    price: Number(v.price),
    is_available: v.is_available !== undefined ? v.is_available : true,
  }));

  const { data, error } = await supabase
    .from('variants')
    .insert(variantsData)
    .select('*');

  if (error) {
    logger.error('createVariants error:', error);
    throw new AppError('Failed to create variants', 500);
  }

  return data;
};

module.exports = { createVariants };

