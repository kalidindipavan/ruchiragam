/**
 * @file user.routes.js
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const addressController = require('../controllers/addressController');
const { authenticate, authorize } = require('../middleware/auth');

// Admin users management
router.get('/', authenticate, authorize('admin'), userController.getAllUsers);

router.patch('/:id', authenticate, authorize('admin'), userController.updateUserDetails);

// User saved addresses (user only)
router.get('/addresses', authenticate, addressController.getAddresses);
router.post('/addresses', authenticate, addressController.createAddress);
router.patch('/addresses/:id', authenticate, addressController.updateAddress);
router.delete('/addresses/:id', authenticate, addressController.deleteAddress);

module.exports = router;
