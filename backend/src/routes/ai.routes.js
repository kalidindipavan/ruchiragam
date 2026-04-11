/**
 * @file ai.routes.js
 */

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const { aiLimiter } = require('../middleware/rateLimiter');

// Apply AI rate limiter to all AI routes
router.use(aiLimiter);

router.post('/search', validate(schemas.aiSearch), aiController.aiSearch);
router.get('/recommendations', optionalAuth, aiController.getRecommendations);
router.post('/generate-description', authenticate, authorize('admin', 'seller'), validate(schemas.generateDescription), aiController.generateDescription);

module.exports = router;
