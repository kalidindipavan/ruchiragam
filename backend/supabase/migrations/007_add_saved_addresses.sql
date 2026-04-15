-- Migration 007: Add saved_addresses table for user profile addresses
-- Allows pre-filling checkout forms

CREATE TABLE saved_addresses (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_default   BOOLEAN NOT NULL DEFAULT FALSE,
  street       TEXT NOT NULL,
  city         TEXT NOT NULL,
  state        TEXT NOT NULL,
  postal_code  VARCHAR(10) NOT NULL,
  phone_number VARCHAR(15) NOT NULL,
  country      VARCHAR(2) NOT NULL DEFAULT 'IN',
  name         VARCHAR(100),  -- "Home", "Work"
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure only one default address per user
CREATE UNIQUE INDEX idx_saved_addresses_user_default ON saved_addresses (user_id) WHERE is_default = TRUE;

-- RLS
ALTER TABLE saved_addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own addresses" ON saved_addresses 
  FOR ALL USING (auth.uid()::uuid = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_saved_addresses_updated_at 
BEFORE UPDATE ON saved_addresses 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE saved_addresses IS 'Saved delivery addresses for user profile pre-fill in checkout';
