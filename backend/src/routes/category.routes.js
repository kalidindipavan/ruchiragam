/**
 * @file category.routes.js
 */

const express = require('express');
const router = express.Router();
const { sendSuccess, sendCreated } = require('../utils/apiResponse');
const { AppError } = require('../middleware/errorHandler');
const { authenticate, authorize } = require('../middleware/auth');
const categoryService = require('../services/categoryService');

// GET /api/categories — Public list
router.get('/', async (req, res) => {
  const categories = await categoryService.getAllCategories(false);
  return sendSuccess(res, categories, 'Categories fetched');
});

// GET /api/categories/:slug — Single category by slug
router.get('/:slug', async (req, res) => {
  const category = await categoryService.getCategoryBySlug(req.params.slug);
  return sendSuccess(res, category, 'Category fetched');
});

// ─── ADMIN ROUTES ───────────────────────────────────────────────────────────
router.use(authenticate, authorize('admin'));

// GET /api/categories/admin — Full list for management
router.get('/admin/all', async (req, res) => {
  const categories = await categoryService.getAllCategories(true);
  return sendSuccess(res, categories, 'All categories fetched for admin');
});

// POST /api/categories — Create category
router.post('/', async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  return sendCreated(res, category, 'Category created successfully');
});

// PATCH /api/categories/:id — Update category
router.patch('/:id', async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body);
  return sendSuccess(res, category, 'Category updated successfully');
});

// DELETE /api/categories/:id — Delete category
router.delete('/:id', async (req, res) => {
  await categoryService.deleteCategory(req.params.id);
  return sendSuccess(res, null, 'Category deleted successfully');
});

module.exports = router;
