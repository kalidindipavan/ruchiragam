/**
 * @file addressController.js
 * @description User saved addresses management
 */

const addressService = require('../services/addressService');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');

/**
 * GET /api/addresses — Get user's saved addresses
 */
const getAddresses = async (req, res) => {
  const addresses = await addressService.getUserAddresses(req.user.id);
  return sendSuccess(res, addresses, 'Saved addresses retrieved');
};

/**
 * POST /api/addresses — Create new saved address
 */
const createAddress = async (req, res) => {
  const address = await addressService.createAddress(req.user.id, req.body);
  return sendCreated(res, address, 'Address saved successfully');
};

/**
 * PATCH /api/addresses/:id — Update saved address
 */
const updateAddress = async (req, res) => {
  const address = await addressService.updateAddress(req.user.id, req.params.id, req.body);
  return sendSuccess(res, address, 'Address updated successfully');
};

/**
 * DELETE /api/addresses/:id — Delete saved address
 */
const deleteAddress = async (req, res) => {
  await addressService.deleteAddress(req.user.id, req.params.id);
  return sendSuccess(res, { success: true }, 'Address deleted');
};

module.exports = {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
};

