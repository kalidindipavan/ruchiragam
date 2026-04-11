/**
 * @file user.routes.js
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

// All endpoints in this manifest strictly require absolute Admin privileges mapping
router.get('/', authenticate, authorize('admin'), userController.getAllUsers);

router.patch('/:id', authenticate, authorize('admin'), userController.updateUserDetails);

module.exports = router;
