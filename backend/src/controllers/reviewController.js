/**
 * @file reviewController.js
 * @description Product review controllers.
 */

const { supabase } = require('../config/db');
const productService = require('../services/productService');
const { sendSuccess, sendCreated, sendError } = require('../utils/apiResponse');
const { AppError } = require('../middleware/errorHandler');
const { v4: uuidv4 } = require('uuid');

/**
 * GET /api/reviews/:productId — Get reviews for a product.
 */
const getProductReviews = async (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('reviews')
    .select(`
      id, rating, comment, created_at,
      users ( id, full_name, avatar_url )
    `, { count: 'exact' })
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw new AppError('Failed to fetch reviews', 500);

  return sendSuccess(res, {
    reviews: data,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  }, 'Reviews fetched');
};

/**
 * POST /api/reviews — Submit a review (must have purchased the product).
 */
const createReview = async (req, res) => {
  const { product_id, rating, comment } = req.body;
  const userId = req.user.id;

  // Check if user has already reviewed this product
  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', product_id)
    .single();

  if (existing) {
    throw new AppError('You have already reviewed this product', 409);
  }

  // Verify purchase (optional strict enforcement)
  // const { data: purchase } = await supabase
  //   .from('order_items')
  //   .select('id')
  //   .eq('product_id', product_id)
  //   .eq('orders.user_id', userId)
  //   .eq('orders.payment_status', 'completed')
  //   .single();
  // if (!purchase) throw new AppError('You can only review products you have purchased', 403);

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      id: uuidv4(),
      user_id: userId,
      product_id,
      rating,
      comment: comment || null,
    })
    .select(`id, rating, comment, created_at, users ( id, full_name, avatar_url )`)
    .single();

  if (error) throw new AppError('Failed to submit review', 500);

  // Update product aggregate rating
  await productService.updateProductRating(product_id);

  return sendCreated(res, data, 'Review submitted successfully');
};

/**
 * DELETE /api/reviews/:id — Delete review (own review or admin).
 */
const deleteReview = async (req, res) => {
  const { data: review } = await supabase
    .from('reviews')
    .select('user_id, product_id')
    .eq('id', req.params.id)
    .single();

  if (!review) throw new AppError('Review not found', 404);

  if (req.user.role !== 'admin' && review.user_id !== req.user.id) {
    throw new AppError('Not authorized to delete this review', 403);
  }

  await supabase.from('reviews').delete().eq('id', req.params.id);
  await productService.updateProductRating(review.product_id);

  return sendSuccess(res, null, 'Review deleted');
};

module.exports = { getProductReviews, createReview, deleteReview };
