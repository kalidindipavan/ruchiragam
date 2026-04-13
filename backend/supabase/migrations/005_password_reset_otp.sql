-- ============================================================
-- Migration: 005_password_reset_otp.sql
-- Description: Drop UNIQUE constraint on token for OTP usage
-- ============================================================

-- Drop the unique constraint so multiple users can theoretically have '123456' at the same time.
-- We verify against BOTH user_id and token.
ALTER TABLE password_reset_tokens DROP CONSTRAINT IF EXISTS password_reset_tokens_token_key;
