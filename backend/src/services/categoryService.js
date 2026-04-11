/**
 * @file categoryService.js
 * @description Category management service logic.
 */

const { supabase } = require('../config/db');
const { AppError } = require('../middleware/errorHandler');

/**
 * Get all categories.
 */
const getAllCategories = async (adminView = false) => {
  let query = supabase
    .from('categories')
    .select('id, name, slug, description, image_url, product_count, is_active')
    .order('name');

  if (!adminView) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;
  if (error) throw new AppError('Failed to fetch categories', 500);
  return data;
};

/**
 * Get category by slug.
 */
const getCategoryBySlug = async (slug) => {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, description, image_url')
    .eq('slug', slug)
    .single();

  if (error || !data) throw new AppError('Category not found', 404);
  return data;
};

/**
 * Create Category.
 */
const createCategory = async (categoryData) => {
  const slug = categoryData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  const { data, error } = await supabase
    .from('categories')
    .insert([{ 
      ...categoryData, 
      slug,
      is_active: categoryData.is_active ?? true 
    }])
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') throw new AppError('Category slug already exists', 400);
    throw new AppError('Failed to create category', 500);
  }
  return data;
};

/**
 * Update Category.
 */
const updateCategory = async (id, categoryData) => {
  const updatePayload = { ...categoryData };
  if (categoryData.name) {
    updatePayload.slug = categoryData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  const { data, error } = await supabase
    .from('categories')
    .update(updatePayload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') throw new AppError('Category slug already exists', 400);
    throw new AppError('Failed to update category', 500);
  }
  return data;
};

/**
 * Delete Category.
 */
const deleteCategory = async (id) => {
  // Check if there are products in this category (optional, trigger handles product_count but maybe we should block deletion)
  const { data: products } = await supabase
    .from('products')
    .select('id')
    .eq('category_id', id)
    .limit(1);

  if (products && products.length > 0) {
    throw new AppError('Cannot delete category with existing products. Reassign or delete products first.', 400);
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw new AppError('Failed to delete category', 500);
  return true;
};

module.exports = {
  getAllCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
};
