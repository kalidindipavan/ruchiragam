/**
 * @file variantController.js
 * @description Variant REST API controllers.
 */

const variantService = require('../services/variantService');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');
const { authMiddleware } = require('../middleware/auth');

const createProductVariants = async (req, res) => {
  const variants = await variantService.createVariants(req.params.id, req.body);
  return sendCreated(res, variants, 'Variants created successfully');
};

module.exports = { createProductVariants };

