-- ============================================================
-- Migration: 004_add_reset_tokens.sql
-- Description: Table for password reset tokens
-- ============================================================

CREATE TABLE password_reset_tokens (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens (user_id);
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens (token);

-- RLS
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
-- Backend (service role) bypasses RLS, but adding policy for completeness
CREATE POLICY "Admins can view reset tokens" ON password_reset_tokens USING (auth.jwt() ->> 'role' = 'admin');
