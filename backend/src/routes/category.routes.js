/**
 * @file category.routes.js
 */

const express = require('express');
const router = express.Router();
const { supabase } = require('../config/db');
const { sendSuccess } = require('../utils/apiResponse');
const { AppError } = require('../middleware/errorHandler');
const { authenticate, authorize } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// GET /api/categories
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, description, image_url, product_count')
    .eq('is_active', true)
    .order('name');

  if (error) throw new AppError('Failed to fetch categories', 500);
  return sendSuccess(res, data, 'Categories fetched');
});

// GET /api/categories/:slug
router.get('/:slug', async (req, res) => {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, description, image_url')
    .eq('slug', req.params.slug)
    .single();

  if (error || !data) throw new AppError('Category not found', 404);
  return sendSuccess(res, data, 'Category fetched');
});

// POST /api/categories — Admin only
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  const { name, description, image_url } = req.body;
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const { data, error } = await supabase
    .from('categories')
    .insert({ id: uuidv4(), name, slug, description, image_url, is_active: true })
    .select('*')
    .single();

  if (error) throw new AppError('Failed to create category', 500);
  return res.status(201).json({ success: true, data, message: 'Category created' });
});

module.exports = router;
