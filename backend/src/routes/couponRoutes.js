/**
 * @file couponRoutes.js
 * @description Coupon related API routes.
 */

const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { protect } = require('../middleware/authMiddleware');

// Validate coupon (requires authentication for security)
router.post('/validate', protect, couponController.validateCoupon);

module.exports = router;
