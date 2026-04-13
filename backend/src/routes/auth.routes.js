/**
 * @file auth.routes.js
 */

const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');

// Apply auth rate limiter to sensitive endpoints
router.post('/register', authLimiter, validate(schemas.register), authController.register);
router.post('/login', authLimiter, validate(schemas.login), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);
router.post('/forgot-password', authLimiter, validate(schemas.forgotPassword), authController.forgotPassword);
router.post('/reset-password', authLimiter, validate(schemas.resetPassword), authController.resetPassword);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/api/auth/google/failure' }),
  authController.googleCallback
);
router.get('/google/failure', (req, res) => {
  res.redirect(`${process.env.CLIENT_URL}/auth/login?error=oauth_failed`);
});

module.exports = router;
