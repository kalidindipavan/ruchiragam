-- ============================================================
-- Ruchi Ragam — Add Coupons and Update Orders
-- Migration: 003_add_coupons.sql
-- ============================================================

-- ─── COUPONS ────────────────────────────────────────────────────────────────
CREATE TABLE coupons (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code              VARCHAR(50) NOT NULL UNIQUE,
  discount_type     VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value    DECIMAL(10, 2) NOT NULL CHECK (discount_value > 0),
  min_order_amount  DECIMAL(10, 2) DEFAULT 0,
  max_discount      DECIMAL(10, 2),    -- Only for percentage types
  usage_limit       INTEGER,           -- Total uses allowed (NULL = unlimited)
  usage_count       INTEGER DEFAULT 0, -- Current uses
  expires_at        TIMESTAMPTZ,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_coupons_code ON coupons (code);

-- ─── UPDATE ORDERS ───────────────────────────────────────────────────────────
ALTER TABLE orders ADD COLUMN discount_amount DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN coupon_code VARCHAR(50);

-- ─── SEED DATA ──────────────────────────────────────────────────────────────
INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, usage_limit, expires_at) VALUES
  ('WELCOME10', 'percentage', 10.00, 200.00, 500, NOW() + INTERVAL '1 year'),
  ('RUCHI50', 'fixed', 50.00, 500.00, 200, NOW() + INTERVAL '1 year'),
  ('FESTIVE20', 'percentage', 20.00, 1000.00, 100, NOW() + INTERVAL '1 month');

-- ─── FUNCTIONS ──────────────────────────────────────────────────────────────
-- Atomic increment for coupon usage
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_code_param TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE coupons
  SET usage_count = usage_count + 1
  WHERE code = coupon_code_param;
END;
$$ LANGUAGE plpgsql;
