/**
 * @file aiController.js
 * @description AI feature controllers.
 */

const aiService = require('../services/aiService');
const productService = require('../services/productService');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * POST /api/ai/search — Natural language product search.
 */
const aiSearch = async (req, res) => {
  const { query } = req.body;

  // Convert natural language to filters
  const filters = await aiService.naturalLanguageSearch(query);

  // Apply filters to product search
  const result = await productService.getProducts({ ...filters, page: 1, limit: 20 });

  return sendSuccess(res, {
    filters_applied: filters,
    ...result,
  }, 'AI search completed');
};

/**
 * GET /api/ai/recommendations — Personalized product recommendations.
 */
const getRecommendations = async (req, res) => {
  const { category_id } = req.query;
  const userId = req.user?.id || null; // optionalAuth

  const products = await aiService.getRecommendations(userId, category_id);

  return sendSuccess(res, products, 'Recommendations fetched');
};

/**
 * POST /api/ai/generate-description — Admin: AI-generated product description.
 */
const generateDescription = async (req, res) => {
  const result = await aiService.generateProductDescription(req.body);
  return sendSuccess(res, result, 'Description generated successfully');
};

module.exports = { aiSearch, getRecommendations, generateDescription };
