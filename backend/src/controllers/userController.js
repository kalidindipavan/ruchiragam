/**
 * @file userController.js
 * @description User accounts management endpoint controllers.
 */

const userService = require('../services/userService');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * GET /api/users
 * Admin only: get all registered users with pagination & search
 */
const getAllUsers = async (req, res) => {
  const { page, limit, search, role } = req.query;
  const result = await userService.getAllUsers({
    page: Number(page) || 1,
    limit: Number(limit) || 20,
    search,
    role,
  });
  return sendSuccess(res, result, 'Registered user accounts retrieved successfully');
};

/**
 * PATCH /api/users/:id
 * Admin only: update user properties like role and is_active flag.
 */
const updateUserDetails = async (req, res) => {
  const { role, is_active } = req.body;
  const payload = {};
  
  if (role !== undefined) payload.role = role;
  if (is_active !== undefined) payload.is_active = is_active;

  const result = await userService.updateUserAdminLogic(req.params.id, payload);
  return sendSuccess(res, result, 'User account metadata updated');
};

module.exports = {
  getAllUsers,
  updateUserDetails,
};
