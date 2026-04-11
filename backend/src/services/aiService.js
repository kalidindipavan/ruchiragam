/**
 * @file aiService.js
 * @description AI-powered features using OpenAI GPT-4o.
 * - Natural language search → product filters
 * - Personalized recommendations
 * - AI product description generation (admin)
 */

const OpenAI = require('openai');
const env = require('../config/env');
const { supabase } = require('../config/db');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

/**
 * Convert natural language query into structured product filters.
 * @param {string} query - e.g. "spicy vegan curry under 200 rupees"
 * @returns {object} Structured filter object for productService.getProducts
 */
const naturalLanguageSearch = async (query) => {
  try {
    const systemPrompt = `You are a product search assistant for Ruchi Ragam, a traditional Indian Pickles and Podis (spice powders) marketplace.
Convert the user's natural language query into a structured JSON filter object.

Available filter fields:
- search: string (product name keyword)
- category: string (one of: "Mango Pickles", "Veg Pickles", "Non-Veg Pickles", "Podis & Powders", "Masalas")
- is_vegetarian: boolean
- is_vegan: boolean
- is_gluten_free: boolean
- is_spicy: boolean
- min_price: number (INR)
- max_price: number (INR)
- spice_level_min: number (0-5)

Return ONLY valid JSON, no explanation. Example:
{"search": "avakaya", "is_vegetarian": true, "max_price": 400}`;

    const response = await openai.chat.completions.create({
      model: env.OPENAI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 200,
      temperature: 0.1,
    });

    const filters = JSON.parse(response.choices[0].message.content);
    logger.info(`AI search: "${query}" → ${JSON.stringify(filters)}`);
    return filters;
  } catch (err) {
    logger.error('AI search error:', err);
    throw new AppError('AI search temporarily unavailable', 503);
  }
};

/**
 * Get personalized product recommendations.
 * @param {string|null} userId - Current user ID (null for guest)
 * @param {string|null} categoryId - Current viewing context
 * @returns {Array} Array of products
 */
const getRecommendations = async (userId, categoryId) => {
  // Fetch context data for recommendations
  let userHistory = [];
  let popularProducts = [];

  if (userId) {
    // Get user's order history for personalization
    const { data: orders } = await supabase
      .from('order_items')
      .select('product_id, product_name, quantity')
      .eq('orders.user_id', userId)
      .limit(20);
    userHistory = orders || [];
  }

  // Get top-rated products in category context
  let query = supabase
    .from('products')
    .select('id, name, price, image_url, rating_avg, rating_count, is_vegetarian, tags, categories(name)')
    .eq('status', 'active')
    .order('rating_avg', { ascending: false })
    .limit(20);

  if (categoryId) query = query.eq('category_id', categoryId);

  const { data } = await query;
  popularProducts = data || [];

  if (!popularProducts.length) return [];

  // Use AI to rank/filter recommendations based on context
  if (userHistory.length > 0) {
    try {
      const systemPrompt = `You are a recommendation engine for an Indian Pickles and Podis marketplace.
Given the user's order history and available products, return the IDs of the top 8 most relevant products to recommend.
Return ONLY a JSON array of product IDs. Example: ["id1", "id2", "id3"]`;

      const userMessage = `
Order history (product names): ${userHistory.map((o) => o.product_name).join(', ')}
Available products: ${JSON.stringify(popularProducts.map((p) => ({ id: p.id, name: p.name, category: p.categories?.name })))}`;

      const response = await openai.chat.completions.create({
        model: env.OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 300,
        temperature: 0.3,
      });

      const content = JSON.parse(response.choices[0].message.content);
      const recommendedIds = content.recommendations || content.ids || Object.values(content)[0] || [];

      const ordered = recommendedIds
        .map((id) => popularProducts.find((p) => p.id === id))
        .filter(Boolean);

      return ordered.length > 0 ? ordered.slice(0, 8) : popularProducts.slice(0, 8);
    } catch (err) {
      logger.error('AI recommendations error:', err);
      // Fallback to popularity-based
    }
  }

  return popularProducts.slice(0, 8);
};

/**
 * Generate a product description using AI (admin tool).
 * @param {object} productInfo - { name, category, ingredients, taste_profile }
 * @returns {{ description, tags, seoDescription }}
 */
const generateProductDescription = async ({ name, category, ingredients, taste_profile }) => {
  try {
    const systemPrompt = `You are a professional copywriter for Ruchi Ragam, a traditional Indian Pickles (Pachallu) and Podis marketplace.
Write an enticing, authentic product description that:
- Highlights the homemade, authentic nature
- Mentions key flavors and textures
- Uses warm, inviting language
- Is 2-3 sentences (50-80 words)
- Also generate 5 relevant tags and a 1-sentence SEO meta description

Return JSON: { "description": "...", "tags": ["tag1", ...], "seo_description": "..." }`;

    const userMessage = `
Product Name: ${name}
Category: ${category}
Ingredients: ${ingredients?.join(', ') || 'Not specified'}
Taste Profile: ${taste_profile || 'Traditional Indian'}`;

    const response = await openai.chat.completions.create({
      model: env.OPENAI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 400,
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content);
    logger.info(`AI description generated for: ${name}`);
    return result;
  } catch (err) {
    logger.error('AI generateDescription error:', err);
    throw new AppError('AI description generation failed', 503);
  }
};

module.exports = { naturalLanguageSearch, getRecommendations, generateProductDescription };
