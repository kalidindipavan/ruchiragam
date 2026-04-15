/**
 * @file orderController.js
 * @description Order management controllers.
 */

const orderService = require('../services/orderService');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');

/**
 * POST /api/orders — Create order from cart.
 */
const createOrder = async (req, res) => {
  const order = await orderService.createOrder(req.user.id, req.body);
  return sendCreated(res, order, 'Order created successfully');
};

/**
 * GET /api/orders/me — Get authenticated user's orders.
 */
const getMyOrders = async (req, res) => {
  const { page, limit } = req.query;
  const result = await orderService.getUserOrders(req.user.id, {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
  });
  return sendSuccess(res, result, 'Orders fetched');
};

/**
 * GET /api/orders/:id — Get single order.
 */
const getOrderById = async (req, res) => {
  const order = await orderService.getOrderById(req.params.id, req.user.id, req.user.role);
  return sendSuccess(res, order, 'Order fetched');
};

/**
 * PATCH /api/orders/:id/cancel — User: cancel own order.
 */
const cancelMyOrder = async (req, res) => {
  const order = await orderService.cancelMyOrder(req.params.id, req.user.id);
  return sendSuccess(res, order, 'Order cancelled successfully');
};

/**
 * GET /api/orders — Admin: Get all orders.
 */
const getAllOrders = async (req, res) => {
  const { page, limit, status } = req.query;
  const result = await orderService.getAllOrders({
    page: Number(page) || 1,
    limit: Number(limit) || 20,
    status,
  });
  return sendSuccess(res, result, 'Orders fetched');
};

/**
 * PATCH /api/orders/:id/status — Admin: Update order status.
 */
const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const order = await orderService.updateOrderStatus(req.params.id, status);
  return sendSuccess(res, order, 'Order status updated');
};

module.exports = { createOrder, getMyOrders, getOrderById, cancelMyOrder, getAllOrders, updateOrderStatus };
