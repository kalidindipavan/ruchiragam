/**
 * @file stats.routes.js
 */

const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { authenticate, authorize } = require('../middleware/auth');

// All endpoints in this manifest strictly require absolute Admin privileges mapping
router.get('/dashboard', authenticate, authorize('admin'), statsController.getDashboardStats);

module.exports = router;
