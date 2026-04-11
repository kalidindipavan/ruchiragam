/**
 * @file couponRoutes.js
 * @description Coupon related API routes.
 */

const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { authenticate, authorize } = require('../middleware/auth');

// Validate coupon (Public-ish, but requires login)
router.post('/validate', authenticate, couponController.validateCoupon);

// Admin Routes
router.use(authenticate, authorize('admin'));

router.get('/', couponController.getAllCoupons);
router.post('/', couponController.createCoupon);
router.patch('/:id', couponController.updateCoupon);
router.delete('/:id', couponController.deleteCoupon);

module.exports = router;
