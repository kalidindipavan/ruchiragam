/**
 * @file orderService.js
 * @description Order creation, management, and status tracking.
 */

const { supabase } = require('../config/db');
const { AppError } = require('../middleware/errorHandler');
const { ORDER_STATUS } = require('../config/constants');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const couponService = require('./couponService');
const emailService = require('./emailService');

/**
 * Send order confirmation email for a specific order.
 * Fire-and-forget (logs on failure, does not throw).
 */
const sendOrderConfirmation = async (orderId, fallbackUserId = null) => {
  try {
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single();

    if (orderError || !orderData) return;

    let user = null;

    if (fallbackUserId) {
      const { data: userData } = await supabase
        .from('users')
        .select('email, full_name')
        .eq('id', fallbackUserId)
        .single();
      user = userData;
    } else {
      const { data: userData } = await supabase
        .from('users')
        .select('email, full_name')
        .eq('id', orderData.user_id)
        .single();
      user = userData;
    }

    if (user?.email) {
      await emailService.sendOrderConfirmationEmail(orderData, user);
    }
  } catch (emailErr) {
    logger.error(`Failed to send confirmation email for order ${orderId}:`, emailErr);
  }
};

/**
 * Create a new order from user's cart.
 * Validates stock, calculates total, clears cart.
 */
const createOrder = async (userId, { delivery_address, payment_provider, special_instructions, coupon_code }) => {
  // Fetch user's cart with product details
  const { data: cartItems, error: cartError } = await supabase
    .from('cart_items')
    .select(`
      id, quantity, variant_id,
      products ( id, name, price, status, max_orders_per_day, image_url ),
      variants ( id, name, price )
    `)
    .eq('user_id', userId);

  if (cartError || !cartItems?.length) {
    throw new AppError('Cart is empty', 400);
  }

  // Validate all products are active
  for (const item of cartItems) {
    if (item.products.status !== 'active') {
      throw new AppError(`Product "${item.products.name}" is no longer available', 400`);
    }
  }

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.variants?.price || item.products.price;
    return sum + price * item.quantity;
  }, 0);

  const deliveryFee = subtotal > 500 ? 0 : 50; // Free delivery above ₹500
  
  // Handle Coupon
  let discountAmount = 0;
  if (coupon_code) {
    const couponResult = await couponService.validateCoupon(coupon_code, subtotal);
    if (couponResult) {
      discountAmount = couponResult.discountAmount;
    }
  }

  // Final Total (Tax removed as per request). Guard against negative totals from aggressive discounts.
  const total = Math.max(subtotal + deliveryFee - discountAmount, 0);

  // Determine initial statuses based on payment provider
  const isCOD = payment_provider === 'cod';
  const initialOrderStatus = (total === 0 || isCOD) ? ORDER_STATUS.CONFIRMED : ORDER_STATUS.PENDING;
  const initialPaymentStatus = (total === 0) ? 'completed' : 'pending'; // COD stays 'pending' until cash collected
  const initialPaymentId = isCOD ? 'COD' : (total === 0 ? 'FREE_ORDER' : null);

  // Create order
  const orderId = uuidv4();
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      id: orderId,
      user_id: userId,
      status: initialOrderStatus,
      subtotal,
      delivery_fee: deliveryFee,
      tax: 0, // Tax removed
      discount_amount: discountAmount,
      coupon_code: coupon_code || null,
      total,
      payment_provider,
      payment_status: initialPaymentStatus,
      payment_id: initialPaymentId,
      delivery_address,
      special_instructions: special_instructions || null,
    })
    .select('*')
    .single();

  if (orderError) {
    logger.error('createOrder error:', orderError);
    throw new AppError('Failed to create order', 500);
  }

  // Create order items
  const orderItems = cartItems.map((item) => ({
    id: uuidv4(),
    order_id: orderId,
    product_id: item.products.id,
    variant_id: item.variant_id || null,
    product_name: item.products.name,
    product_image: item.products.image_url,
    variant_name: item.variants?.name || null,
    quantity: item.quantity,
    unit_price: item.variants?.price || item.products.price,
    total_price: (item.variants?.price || item.products.price) * item.quantity,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

  if (itemsError) {
    // Rollback order
    await supabase.from('orders').delete().eq('id', orderId);
    throw new AppError('Failed to create order items', 500);
  }

  // Clear cart
  await supabase.from('cart_items').delete().eq('user_id', userId);

  // Increment coupon usage count if applicable
  if (coupon_code) {
    await supabase.rpc('increment_coupon_usage', { coupon_code_param: coupon_code });
  }

  // Send confirmation email for immediate confirmations (COD/zero total)
  if (initialOrderStatus === ORDER_STATUS.CONFIRMED) {
    await sendOrderConfirmation(orderId, userId);
  }

  return { ...order, items: orderItems };
};

/**
 * Get all orders for a user.
 */
const getUserOrders = async (userId, { page = 1, limit = 10 }) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('orders')
    .select(`
      id, status, total, payment_provider, payment_status, created_at,
      order_items ( id, product_id, product_name, product_image, quantity, unit_price, total_price )
    `, { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw new AppError('Failed to fetch orders', 500);

  return {
    orders: data,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
};

/**
 * Get order by ID (user can only see their own, admin can see all).
 */
const getOrderById = async (orderId, userId, userRole) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items ( * ),
      payments ( id, provider, status, amount, created_at )
    `)
    .eq('id', orderId)
    .single();

  if (error || !data) throw new AppError('Order not found', 404);

  if (userRole !== 'admin' && data.user_id !== userId) {
    throw new AppError('Not authorized to view this order', 403);
  }

  return data;
};

/**
 * Cancel order (user-owned order only).
 * Allowed only before preparation starts.
 */
const cancelMyOrder = async (orderId, userId) => {
  const { data: order, error } = await supabase
    .from('orders')
    .select('id, user_id, status, payment_status')
    .eq('id', orderId)
    .single();

  if (error || !order) throw new AppError('Order not found', 404);
  if (order.user_id !== userId) throw new AppError('Not authorized to cancel this order', 403);

  const cancellableStatuses = [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED];
  if (!cancellableStatuses.includes(order.status)) {
    throw new AppError('Order can no longer be cancelled at this stage', 400);
  }

  // Online completed payments require refund handling flow by support/admin.
  if (order.payment_status === 'completed') {
    throw new AppError('Paid orders cannot be self-cancelled. Please contact support for refund.', 400);
  }

  const { data: updated, error: updateError } = await supabase
    .from('orders')
    .update({ status: ORDER_STATUS.CANCELLED, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select('*')
    .single();

  if (updateError || !updated) throw new AppError('Failed to cancel order', 500);

  return updated;
};

/**
 * Update order status (admin only).
 */
const updateOrderStatus = async (orderId, status) => {
  if (!Object.values(ORDER_STATUS).includes(status)) {
    throw new AppError('Invalid order status', 400);
  }

  const { data: existingOrder, error: existingError } = await supabase
    .from('orders')
    .select('id, user_id, status')
    .eq('id', orderId)
    .single();

  if (existingError || !existingOrder) throw new AppError('Order not found', 404);

  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select('*')
    .single();

  if (error || !data) throw new AppError('Order not found', 404);

  const justConfirmed = existingOrder.status !== ORDER_STATUS.CONFIRMED && status === ORDER_STATUS.CONFIRMED;
  if (justConfirmed) {
    await sendOrderConfirmation(orderId, existingOrder.user_id);
  }

  return data;
};

/**
 * Mark order as paid (called from payment service).
 */
const markOrderPaid = async (orderId, paymentId) => {
  const { data, error } = await supabase
    .from('orders')
    .update({
      status: ORDER_STATUS.CONFIRMED,
      payment_status: 'completed',
      payment_id: paymentId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select('*, order_items(*), users(id, email, full_name)')
    .single();

  if (error) throw new AppError('Failed to update order payment status', 500);

  // Send confirmation email on payment success
  await sendOrderConfirmation(data.id, data.users?.id);

  return data;
};

/**
 * Get all orders (admin).
 */
const getAllOrders = async ({ page = 1, limit = 20, status }) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('orders')
    .select(`
      id, status, total, payment_status, created_at,
      users ( id, full_name, email ),
      order_items ( id, product_name, quantity )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (status) query = query.eq('status', status);

  const { data, error, count } = await query;
  if (error) throw new AppError('Failed to fetch orders', 500);

  return {
    orders: data,
    pagination: { page: Number(page), limit: Number(limit), total: count, totalPages: Math.ceil(count / limit) },
  };
};

module.exports = { createOrder, getUserOrders, getOrderById, cancelMyOrder, updateOrderStatus, markOrderPaid, getAllOrders };
