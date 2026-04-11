/**
 * @file userService.js
 * @description User accounts management logic for Admin Dashboard.
 */

const { supabase } = require('../config/db');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Get all users with pagination and role filtering.
 */
const getAllUsers = async ({ page = 1, limit = 20, search, role }) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('users')
    .select('id, full_name, email, role, phone, is_active, created_at, last_login', { count: 'exact' });

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }
  
  if (role) {
    query = query.eq('role', role);
  }

  query = query.range(from, to).order('created_at', { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    logger.error('getAllUsers error:', error);
    throw new AppError('Failed to fetch users', 500);
  }

  return {
    users: data,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
};

/**
 * Update user role or active status.
 */
const updateUserAdminLogic = async (userId, payload) => {
  // Prevent changing the internal root admin if we want, or at least ensure valid roles
  if (payload.role && !['user', 'seller', 'admin'].includes(payload.role)) {
    throw new AppError('Invalid role applied', 400);
  }

  const { data, error } = await supabase
    .from('users')
    .update({ 
      ...payload, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', userId)
    .select('id, full_name, email, role, is_active')
    .single();

  if (error || !data) {
    logger.error('updateUserAdminLogic error:', error);
    throw new AppError('Failed to modify user account', 500);
  }

  return data;
};

module.exports = {
  getAllUsers,
  updateUserAdminLogic
};
