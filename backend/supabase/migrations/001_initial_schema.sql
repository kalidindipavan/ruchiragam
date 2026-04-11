-- ============================================================
-- Ruchi Ragam — Production Database Schema
-- Supabase / PostgreSQL
-- Migration: 001_initial_schema.sql
-- ============================================================

-- ─── Extensions ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search similarity

-- ─── ENUM Types ──────────────────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('user', 'seller', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled', 'refunded');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE payment_provider AS ENUM ('stripe', 'razorpay');
CREATE TYPE product_status AS ENUM ('active', 'inactive', 'out_of_stock');

-- ─── USERS ───────────────────────────────────────────────────────────────────
CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name         VARCHAR(100) NOT NULL,
  email             VARCHAR(255) NOT NULL UNIQUE,
  password_hash     TEXT,                         -- NULL for OAuth users
  google_id         VARCHAR(255) UNIQUE,
  avatar_url        TEXT,
  phone             VARCHAR(20),
  role              user_role NOT NULL DEFAULT 'user',
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  email_verified    BOOLEAN NOT NULL DEFAULT FALSE,
  login_attempts    SMALLINT NOT NULL DEFAULT 0,
  locked_until      TIMESTAMPTZ,
  last_login        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_google_id ON users (google_id) WHERE google_id IS NOT NULL;
CREATE INDEX idx_users_role ON users (role);

-- ─── REFRESH TOKENS ──────────────────────────────────────────────────────────
CREATE TABLE refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  is_revoked  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens (token);

-- Auto-cleanup: Delete revoked/expired tokens older than 30 days (schedule via cron in Supabase)

-- ─── CATEGORIES ──────────────────────────────────────────────────────────────
CREATE TABLE categories (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(100) NOT NULL UNIQUE,
  slug          VARCHAR(120) NOT NULL UNIQUE,
  description   TEXT,
  image_url     TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  product_count INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories (slug);

-- ─── PRODUCTS ────────────────────────────────────────────────────────────────
CREATE TABLE products (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id                   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id                 UUID NOT NULL REFERENCES categories(id),
  name                        VARCHAR(200) NOT NULL,
  description                 TEXT NOT NULL,
  price                       DECIMAL(10, 2) NOT NULL CHECK (price > 0),
  image_url                   TEXT,
  images                      TEXT[] DEFAULT '{}',
  status                      product_status NOT NULL DEFAULT 'active',
  is_vegetarian               BOOLEAN NOT NULL DEFAULT TRUE,
  is_vegan                    BOOLEAN NOT NULL DEFAULT FALSE,
  is_gluten_free              BOOLEAN NOT NULL DEFAULT FALSE,
  is_spicy                    BOOLEAN NOT NULL DEFAULT FALSE,
  spice_level                 SMALLINT NOT NULL DEFAULT 0 CHECK (spice_level BETWEEN 0 AND 5),
  preparation_time_minutes    INTEGER DEFAULT 30,
  tags                        TEXT[] DEFAULT '{}',
  available_days              TEXT[] DEFAULT '{}',
  max_orders_per_day          INTEGER,
  rating_avg                  DECIMAL(3, 1) NOT NULL DEFAULT 0,
  rating_count                INTEGER NOT NULL DEFAULT 0,
  seo_description             TEXT,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common search patterns
CREATE INDEX idx_products_category ON products (category_id);
CREATE INDEX idx_products_seller ON products (seller_id);
CREATE INDEX idx_products_status ON products (status);
CREATE INDEX idx_products_price ON products (price);
CREATE INDEX idx_products_rating ON products (rating_avg DESC);
CREATE INDEX idx_products_name_trgm ON products USING GIN (name gin_trgm_ops); -- Fuzzy search
CREATE INDEX idx_products_tags ON products USING GIN (tags);
CREATE INDEX idx_products_vegetarian ON products (is_vegetarian) WHERE is_vegetarian = TRUE;

-- ─── PRODUCT VARIANTS ────────────────────────────────────────────────────────
CREATE TABLE variants (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name          VARCHAR(100) NOT NULL,    -- e.g., "Small", "Large", "500g"
  price         DECIMAL(10, 2) NOT NULL CHECK (price > 0),
  is_available  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_variants_product ON variants (product_id);

-- ─── CART ITEMS ──────────────────────────────────────────────────────────────
CREATE TABLE cart_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id  UUID REFERENCES variants(id) ON DELETE SET NULL,
  quantity    SMALLINT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE (user_id, product_id, variant_id)
);

CREATE INDEX idx_cart_items_user ON cart_items (user_id);

-- ─── ORDERS ──────────────────────────────────────────────────────────────────
CREATE TABLE orders (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  status                order_status NOT NULL DEFAULT 'pending',
  subtotal              DECIMAL(10, 2) NOT NULL,
  delivery_fee          DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax                   DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total                 DECIMAL(10, 2) NOT NULL,
  payment_provider      payment_provider,
  payment_status        payment_status NOT NULL DEFAULT 'pending',
  payment_id            VARCHAR(255),              -- Provider's payment/transaction ID
  delivery_address      JSONB NOT NULL,
  special_instructions  TEXT,
  estimated_delivery    TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders (user_id);
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_created ON orders (created_at DESC);
CREATE INDEX idx_orders_payment_status ON orders (payment_status);

-- ─── ORDER ITEMS ─────────────────────────────────────────────────────────────
CREATE TABLE order_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id      UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id      UUID REFERENCES variants(id) ON DELETE SET NULL,
  product_name    VARCHAR(200) NOT NULL,   -- Snapshot at time of order
  product_image   TEXT,
  variant_name    VARCHAR(100),
  quantity        SMALLINT NOT NULL,
  unit_price      DECIMAL(10, 2) NOT NULL,
  total_price     DECIMAL(10, 2) NOT NULL
);

CREATE INDEX idx_order_items_order ON order_items (order_id);
CREATE INDEX idx_order_items_product ON order_items (product_id);

-- ─── PAYMENTS ────────────────────────────────────────────────────────────────
CREATE TABLE payments (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id            UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider            payment_provider NOT NULL,
  status              payment_status NOT NULL DEFAULT 'pending',
  amount              DECIMAL(10, 2) NOT NULL,
  currency            VARCHAR(3) NOT NULL DEFAULT 'INR',
  provider_payment_id VARCHAR(255),
  provider_data       JSONB,                       -- Full provider response
  completed_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_order ON payments (order_id);
CREATE INDEX idx_payments_user ON payments (user_id);
CREATE INDEX idx_payments_status ON payments (status);
CREATE UNIQUE INDEX idx_payments_idempotency ON payments (order_id, provider) WHERE status = 'pending';

-- ─── REVIEWS ─────────────────────────────────────────────────────────────────
CREATE TABLE reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE (user_id, product_id)  -- One review per product per user
);

CREATE INDEX idx_reviews_product ON reviews (product_id);
CREATE INDEX idx_reviews_user ON reviews (user_id);

-- ─── UPDATED_AT TRIGGERS ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── PRODUCT COUNT TRIGGER ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_category_product_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE categories SET product_count = product_count + 1 WHERE id = NEW.category_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE categories SET product_count = GREATEST(product_count - 1, 0) WHERE id = OLD.category_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER product_count_trigger
AFTER INSERT OR DELETE ON products
FOR EACH ROW EXECUTE FUNCTION update_category_product_count();

-- ─── RLS POLICIES ────────────────────────────────────────────────────────────
-- Row Level Security (if using anon key from client directly, otherwise use service role from backend)

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Allow service_role to bypass RLS (backend operations)
-- Public read for products and categories
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are publicly readable" ON products FOR SELECT USING (status = 'active');
CREATE POLICY "Admins can manage products" ON products USING (auth.jwt() ->> 'role' = 'admin');

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are publicly readable" ON categories FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Reviews are publicly readable" ON reviews FOR SELECT USING (TRUE);
