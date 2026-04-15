/**
 * @file product.routes.js
 */

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

// Public
router.get('/', productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/:id', productController.getProductById);

// Protected — Admin/Seller
router.post('/', authenticate, authorize('admin', 'seller'), validate(schemas.createProduct), productController.createProduct);
router.put('/:id', authenticate, authorize('admin', 'seller'), productController.updateProduct);
router.delete('/:id', authenticate, authorize('admin', 'seller'), productController.deleteProduct);
router.post('/:id/variants', authenticate, authorize('admin', 'seller'), require('../controllers/variantController').createProductVariants);

module.exports = router;
