/**
 * @file cart.routes.js
 */

const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticate } = require('../middleware/auth');

// All cart routes require authentication
router.use(authenticate);

router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.put('/:itemId', cartController.updateCartItem);
router.delete('/clear', cartController.clearCart);
router.delete('/:itemId', cartController.removeFromCart);

module.exports = router;
