/**
 * @file order.routes.js
 */

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

// User routes
router.post('/', authenticate, validate(schemas.createOrder), orderController.createOrder);
router.get('/me', authenticate, orderController.getMyOrders);
router.get('/:id', authenticate, orderController.getOrderById);

// Admin routes
router.get('/', authenticate, authorize('admin'), orderController.getAllOrders);
router.patch('/:id/status', authenticate, authorize('admin'), orderController.updateOrderStatus);

module.exports = router;
