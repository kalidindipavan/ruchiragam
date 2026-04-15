/**
 * @file addressService.js
 * @description CRUD operations for user saved addresses
 */

const { supabase } = require('../config/db');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Get user's saved addresses
 */
const getUserAddresses = async (userId) => {
  const { data, error, count } = await supabase
    .from('saved_addresses')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('getUserAddresses error:', error);
    throw new AppError('Failed to fetch addresses', 500);
  }

  return {
    addresses: data || [],
    total: count || 0,
  };
};

/**
 * Create new saved address
 */
const createAddress = async (userId, addressData) => {
  const { data, error } = await supabase
    .from('saved_addresses')
    .insert({
      user_id: userId,
      is_default: addressData.is_default || false,
      street: addressData.street,
      city: addressData.city,
      state: addressData.state,
      postal_code: addressData.postal_code,
      phone_number: addressData.phone_number,
      country: addressData.country || 'IN',
      name: addressData.name,
    })
    .select('*')
    .single();

  if (error) {
    logger.error('createAddress error:', error);
    throw new AppError(error.message, 400);
  }

  // If set as default, unset others
  if (data.is_default) {
    await supabase
      .from('saved_addresses')
      .update({ is_default: false })
      .eq('user_id', userId)
      .neq('id', data.id);
  }

  return data;
};

/**
 * Update address
 */
const updateAddress = async (userId, addressId, addressData) => {
  const { data, error } = await supabase
    .from('saved_addresses')
    .update({ 
      ...addressData,
      updated_at: new Date().toISOString()
    })
    .eq('id', addressId)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error || !data) {
    logger.error('updateAddress error:', error);
    throw new AppError('Address not found or failed to update', 404);
  }

  // Handle default toggle
  if (addressData.is_default) {
    await supabase
      .from('saved_addresses')
      .update({ is_default: false })
      .eq('user_id', userId)
      .neq('id', addressId);
    await supabase
      .from('saved_addresses')
      .update({ is_default: true })
      .eq('id', addressId);
  }

  return data;
};

/**
 * Delete address
 */
const deleteAddress = async (userId, addressId) => {
  const { error } = await supabase
    .from('saved_addresses')
    .update({ is_active: false })
    .eq('id', addressId)
    .eq('user_id', userId);

  if (error) {
    logger.error('deleteAddress error:', error);
    throw new AppError('Failed to delete address', 500);
  }

  return { success: true };
};

module.exports = {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
};

