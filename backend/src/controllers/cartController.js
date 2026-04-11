/**
 * @file cartController.js
 * @description Shopping cart controllers.
 */

const { supabase } = require('../config/db');
const { sendSuccess, sendCreated, sendError } = require('../utils/apiResponse');
const { AppError } = require('../middleware/errorHandler');
const { v4: uuidv4 } = require('uuid');

/**
 * GET /api/cart — Get current user's cart with product details.
 */
const getCart = async (req, res) => {
  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      id, quantity, variant_id, created_at,
      products ( id, name, price, image_url, status, is_vegetarian, is_vegan ),
      variants ( id, name, price )
    `)
    .eq('user_id', req.user.id);

  if (error) throw new AppError('Failed to fetch cart', 500);

  // Calculate totals
  const subtotal = (data || []).reduce((sum, item) => {
    const price = item.variants?.price || item.products?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  return sendSuccess(res, {
    items: data || [],
    subtotal,
    item_count: data?.length || 0,
  }, 'Cart fetched');
};

/**
 * POST /api/cart — Add item or update quantity.
 */
const addToCart = async (req, res) => {
  const { product_id, variant_id, quantity = 1 } = req.body;

  if (!product_id) throw new AppError('product_id is required', 400);

  // Check if item already in cart
  let query = supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('user_id', req.user.id)
    .eq('product_id', product_id);

  if (variant_id) {
    query = query.eq('variant_id', variant_id);
  } else {
    query = query.is('variant_id', null);
  }

  const { data: existing } = await query.single();

  let result;
  if (existing) {
    // Update quantity
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id)
      .select('*')
      .single();

    if (error) throw new AppError('Failed to update cart', 500);
    result = data;
  } else {
    // Insert new item
    const { data, error } = await supabase
      .from('cart_items')
      .insert({
        id: uuidv4(),
        user_id: req.user.id,
        product_id,
        variant_id: variant_id || null,
        quantity,
      })
      .select('*')
      .single();

    if (error) throw new AppError('Failed to add to cart', 500);
    result = data;
  }

  return sendCreated(res, result, 'Item added to cart');
};

/**
 * PUT /api/cart/:itemId — Update item quantity.
 */
const updateCartItem = async (req, res) => {
  const { quantity } = req.body;

  if (!quantity || quantity < 1) throw new AppError('Quantity must be at least 1', 400);

  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', req.params.itemId)
    .eq('user_id', req.user.id) // Security: user can only update their own items
    .select('*')
    .single();

  if (error || !data) throw new AppError('Cart item not found', 404);

  return sendSuccess(res, data, 'Cart updated');
};

/**
 * DELETE /api/cart/:itemId — Remove item from cart.
 */
const removeFromCart = async (req, res) => {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', req.params.itemId)
    .eq('user_id', req.user.id);

  if (error) throw new AppError('Failed to remove cart item', 500);

  return sendSuccess(res, null, 'Item removed from cart');
};

/**
 * DELETE /api/cart — Clear entire cart.
 */
const clearCart = async (req, res) => {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', req.user.id);

  if (error) throw new AppError('Failed to clear cart', 500);

  return sendSuccess(res, null, 'Cart cleared');
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
