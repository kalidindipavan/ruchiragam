/**
 * @file couponRoutes.js
 * @description Coupon related API routes.
 */

const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { authenticate } = require('../middleware/auth');

// Validate coupon (requires authentication for security)
router.post('/validate', authenticate, couponController.validateCoupon);

module.exports = router;
