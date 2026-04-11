/**
 * @file review.routes.js
 */

const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

router.get('/:productId', reviewController.getProductReviews);
router.post('/', authenticate, validate(schemas.createReview), reviewController.createReview);
router.delete('/:id', authenticate, reviewController.deleteReview);

module.exports = router;
