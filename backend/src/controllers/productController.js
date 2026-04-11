/**
 * @file productController.js
 * @description Product REST API controllers.
 */

const productService = require('../services/productService');
const { sendSuccess, sendCreated, sendPaginated } = require('../utils/apiResponse');

/**
 * GET /api/products
 */
const getProducts = async (req, res) => {
  const { page, limit, sort, order, category_id, search, is_vegetarian, is_vegan, max_price, min_price, is_spicy } = req.query;

  const result = await productService.getProducts({
    page: Number(page) || 1,
    limit: Number(limit) || 20,
    sort: sort || 'created_at',
    order: order || 'desc',
    category_id,
    search,
    is_vegetarian: is_vegetarian !== undefined ? is_vegetarian === 'true' : undefined,
    is_vegan: is_vegan !== undefined ? is_vegan === 'true' : undefined,
    is_spicy: is_spicy !== undefined ? is_spicy === 'true' : undefined,
    min_price: min_price ? Number(min_price) : undefined,
    max_price: max_price ? Number(max_price) : undefined,
  });

  return sendPaginated(res, result.products, result.pagination, 'Products fetched');
};

/**
 * GET /api/products/featured
 */
const getFeaturedProducts = async (req, res) => {
  const { limit } = req.query;
  const products = await productService.getFeaturedProducts(Number(limit) || 8);
  return sendSuccess(res, products, 'Featured products fetched');
};

/**
 * GET /api/products/:id
 */
const getProductById = async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  return sendSuccess(res, product, 'Product fetched');
};

/**
 * POST /api/products — Admin/Seller only
 */
const createProduct = async (req, res) => {
  const product = await productService.createProduct(req.body, req.user.id);
  return sendCreated(res, product, 'Product created successfully');
};

/**
 * PUT /api/products/:id — Admin/Seller only
 */
const updateProduct = async (req, res) => {
  const product = await productService.updateProduct(
    req.params.id,
    req.body,
    req.user.id,
    req.user.role
  );
  return sendSuccess(res, product, 'Product updated successfully');
};

/**
 * DELETE /api/products/:id — Admin/Seller only
 */
const deleteProduct = async (req, res) => {
  await productService.deleteProduct(req.params.id, req.user.id, req.user.role);
  return sendSuccess(res, null, 'Product deleted successfully');
};

module.exports = { getProducts, getFeaturedProducts, getProductById, createProduct, updateProduct, deleteProduct };
