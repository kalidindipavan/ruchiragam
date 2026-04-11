/**
 * @file productService.js
 * @description Product CRUD, search, filtering, and pagination logic.
 */

const { supabase } = require('../config/db');
const { AppError } = require('../middleware/errorHandler');
const { DEFAULT_PAGE_SIZE } = require('../config/constants');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

/**
 * Get products with filtering, search, and pagination.
 */
const getProducts = async ({ page = 1, limit = DEFAULT_PAGE_SIZE, sort = 'created_at', order = 'desc', category_id, search, is_vegetarian, is_vegan, max_price, min_price, is_spicy }) => {
  let query = supabase
    .from('products')
    .select(`
      id, name, description, price, image_url, images,
      is_vegetarian, is_vegan, is_gluten_free, is_spicy, spice_level,
      preparation_time_minutes, tags, rating_avg, rating_count,
      status, created_at,
      categories ( id, name, slug ),
      users ( id, full_name )
    `, { count: 'exact' })
    .eq('status', 'active');

  if (category_id) query = query.eq('category_id', category_id);
  if (search) query = query.ilike('name', `%${search}%`);
  if (is_vegetarian !== undefined) query = query.eq('is_vegetarian', is_vegetarian);
  if (is_vegan !== undefined) query = query.eq('is_vegan', is_vegan);
  if (is_spicy !== undefined) query = query.eq('is_spicy', is_spicy);
  if (min_price) query = query.gte('price', min_price);
  if (max_price) query = query.lte('price', max_price);

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to).order(sort, { ascending: order === 'asc' });

  const { data, error, count } = await query;

  if (error) {
    logger.error('getProducts error:', error);
    throw new AppError('Failed to fetch products', 500);
  }

  return {
    products: data,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
};

/**
 * Get single product by ID with full details (variants, reviews sample).
 */
const getProductById = async (id) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories ( id, name, slug ),
      users ( id, full_name, avatar_url ),
      variants ( id, name, price, is_available ),
      reviews ( id, rating, comment, created_at, users ( id, full_name, avatar_url ) )
    `)
    .eq('id', id)
    .single();

  if (error || !data) throw new AppError('Product not found', 404);
  return data;
};

/**
 * Create a new product (admin/seller only).
 */
const createProduct = async (productData, sellerId) => {
  const { data, error } = await supabase
    .from('products')
    .insert({
      id: uuidv4(),
      seller_id: sellerId,
      status: 'active',
      rating_avg: 0,
      rating_count: 0,
      ...productData,
    })
    .select('*')
    .single();

  if (error) {
    logger.error('createProduct error:', error);
    throw new AppError('Failed to create product', 500);
  }
  return data;
};

/**
 * Update a product.
 */
const updateProduct = async (id, updateData, userId, userRole) => {
  // Verify ownership or admin
  const { data: product } = await supabase
    .from('products')
    .select('seller_id')
    .eq('id', id)
    .single();

  if (!product) throw new AppError('Product not found', 404);
  if (userRole !== 'admin' && product.seller_id !== userId) {
    throw new AppError('Not authorized to update this product', 403);
  }

  const { data, error } = await supabase
    .from('products')
    .update({ ...updateData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new AppError('Failed to update product', 500);
  return data;
};

/**
 * Soft-delete a product (set status to inactive).
 */
const deleteProduct = async (id, userId, userRole) => {
  const { data: product } = await supabase
    .from('products')
    .select('seller_id')
    .eq('id', id)
    .single();

  if (!product) throw new AppError('Product not found', 404);
  if (userRole !== 'admin' && product.seller_id !== userId) {
    throw new AppError('Not authorized to delete this product', 403);
  }

  const { error } = await supabase
    .from('products')
    .update({ status: 'inactive', updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new AppError('Failed to delete product', 500);
};

/**
 * Get featured/recommended products.
 */
const getFeaturedProducts = async (limit = 8) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      id, name, price, image_url, rating_avg, rating_count,
      is_vegetarian, is_vegan, spice_level, tags,
      categories ( name )
    `)
    .eq('status', 'active')
    .order('rating_avg', { ascending: false })
    .limit(limit);

  if (error) throw new AppError('Failed to fetch featured products', 500);
  return data;
};

/**
 * Update product rating after new review.
 */
const updateProductRating = async (productId) => {
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('product_id', productId);

  if (!reviews?.length) return;

  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  await supabase
    .from('products')
    .update({
      rating_avg: Math.round(avg * 10) / 10,
      rating_count: reviews.length,
    })
    .eq('id', productId);
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  updateProductRating,
};
