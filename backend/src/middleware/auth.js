/**
 * @file auth.js
 * @description JWT authentication middleware + role-based access control.
 */

const { verifyAccessToken } = require('../utils/jwt');
const { sendError } = require('../utils/apiResponse');
const { supabase } = require('../config/db');
const logger = require('../utils/logger');

/**
 * authenticate — Verifies the Bearer token from Authorization header.
 * Attaches decoded user to req.user.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication required', 401);
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return sendError(res, 'Access token expired', 401);
      }
      return sendError(res, 'Invalid access token', 401);
    }

    // Fetch user from DB to ensure they still exist and aren't suspended
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, role, is_active, full_name')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return sendError(res, 'User not found', 401);
    }

    if (!user.is_active) {
      return sendError(res, 'Account suspended. Contact support.', 403);
    }

    req.user = user;
    next();
  } catch (err) {
    logger.error('Authentication middleware error:', err);
    return sendError(res, 'Authentication failed', 500);
  }
};

/**
 * authorize — Role-based access control guard.
 * @param {...string} roles - Allowed roles
 * @example router.get('/admin', authenticate, authorize('admin'), controller)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }
    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Required role: ${roles.join(' or ')}`,
        403
      );
    }
    next();
  };
};

/**
 * optionalAuth — Tries to authenticate but continues even if token is absent.
 * Used for endpoints that behave differently for authenticated users.
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const { data: user } = await supabase
      .from('users')
      .select('id, email, role, is_active, full_name')
      .eq('id', decoded.userId)
      .single();

    req.user = user?.is_active ? user : null;
    next();
  } catch {
    req.user = null;
    next();
  }
};

module.exports = { authenticate, authorize, optionalAuth };
