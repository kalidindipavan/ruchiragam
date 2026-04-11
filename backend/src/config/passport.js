/**
 * @file passport.js
 * @description Passport.js Google OAuth strategy configuration.
 */

const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const env = require('./env');
const authService = require('../services/authService');
const logger = require('../utils/logger');

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const result = await authService.googleOAuthLogin(profile);
        // Pass the full result (user + tokens) to the callback
        done(null, result);
      } catch (err) {
        logger.error('Google OAuth strategy error:', err);
        done(err, null);
      }
    }
  )
);

// Not using sessions; JWT is stateless
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
