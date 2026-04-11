/**
 * @file statsController.js
 * @description Administrative Analytics Data Aggregation Controller.
 */

const { supabase } = require('../config/db');
const { sendSuccess } = require('../utils/apiResponse');
const { AppError } = require('../middleware/errorHandler');

/**
 * GET /api/stats/dashboard
 * Analyzes tables for KPI metrics like gross revenue and counts.
 */
const getDashboardStats = async (req, res) => {
  try {
    // 1. Calculate Gross Revenue (sum of all delivered/completed orders)
    // We fetch just the total column for paid orders and aggregate in memory.
    const { data: salesData, error: salesError } = await supabase
      .from('orders')
      .select('total')
      .eq('payment_status', 'completed');

    if (salesError) throw salesError;

    const totalRevenue = salesData.reduce((sum, order) => sum + (Number(order.total) || 0), 0);

    // 2. Count Active Orders (Pending or Processing)
    const { count: pendingOrders, error: pendingError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'processing', 'confirmed']);

    if (pendingError) throw pendingError;

    // 3. Count Total Active Food Products
    const { count: activeProducts, error: productsError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    if (productsError) throw productsError;

    // 4. Count Registered User Base
    const { count: totalUsers, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (usersError) throw usersError;

    return sendSuccess(res, {
      totalRevenue: totalRevenue.toFixed(2),
      pendingOrders: pendingOrders || 0,
      activeProducts: activeProducts || 0,
      totalUsers: totalUsers || 0
    }, 'Dashboard metrics computed successfully');

  } catch (err) {
    console.error("Dashboard Stats Error:", err);
    throw new AppError('Failed to aggregate dashboard statistics', 500);
  }
};

module.exports = {
  getDashboardStats
};
