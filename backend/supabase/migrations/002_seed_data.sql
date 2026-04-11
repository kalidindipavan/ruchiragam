-- ============================================================
-- Ruchi Ragam — Seed Data
-- Migration: 002_seed_data.sql
-- Contains Categories, Admin User, Products, and Variants
-- ============================================================

-- ─── Admin User ──────────────────────────────────────────────────────────────
-- Password: Admin@123456
INSERT INTO users (id, full_name, email, password_hash, role, is_active, email_verified) VALUES
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Ruchi Ragam Admin',
    'admin@ruchiragam.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBpJ2VTNcZ3WYS',
    'admin',
    TRUE,
    TRUE
  )
ON CONFLICT (email) DO NOTHING;

-- ─── Categories ──────────────────────────────────────────────────────────────
INSERT INTO categories (id, name, slug, description, image_url, is_active) VALUES
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Mango Pickles',  'mango-pickles',  'Authentic Andhra Avakaya and sweet mango pickles', 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400', TRUE),
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Veg Pickles',    'veg-pickles',    'Tomato, Gongura, Lemon, and mixed vegetable pickles', 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=400', TRUE),
  ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Non-Veg Pickles','non-veg-pickles','Spicy Chicken, Mutton, and Prawn pickles', 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400', TRUE),
  ('c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Podis & Powders','podis-powders',  'Traditional Kandi podi, Karivepaku podi, and more', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400', TRUE),
  ('c4eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Masalas',        'masalas',        'Hand-ground spice blends for daily cooking', 'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=400', TRUE)
ON CONFLICT (slug) DO NOTHING;

-- ─── Products ────────────────────────────────────────────────────────────────
-- Insert sample products assigned to the Admin user
INSERT INTO products (id, seller_id, category_id, name, description, price, image_url, images, status, is_vegetarian, is_vegan, is_spicy, spice_level, tags, preparation_time_minutes, rating_avg, rating_count) VALUES

  -- Mango Pickles
  (
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
    'Andhra Special Avakaya (Guntur Red)', 
    'Our signature Andhra Avakaya made with specially selected Guntur red chillies, cold-pressed sesame oil, and raw mangos sun-dried to perfection. A spicy, tangy explosion of authentic heritage.', 
    349.00, 
    'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800', 
    ARRAY['https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800']::TEXT[], 
    'active', TRUE, TRUE, TRUE, 5, ARRAY['mango', 'avakaya', 'spicy', 'andhra']::TEXT[], 15, 4.9, 128
  ),
  (
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
    'Bellam Avakaya (Sweet Mango)', 
    'A delightful balance of jaggery (bellam) and raw mango. Perfect for those who love a sweet, tangy, and mildly spicy kick in their meals. A favorite among children and adults alike.', 
    329.00, 
    'https://images.unsplash.com/photo-1582515073490-39981397c445?w=800', 
    ARRAY[]::TEXT[], 
    'active', TRUE, TRUE, FALSE, 2, ARRAY['mango', 'sweet', 'jaggery', 'mild']::TEXT[], 15, 4.7, 85
  ),

  -- Veg Pickles
  (
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
    'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 
    'Guntur Gongura Pachadi', 
    'Made from freshly plucked sorrel leaves (Gongura) cooked with pungent spices and garlic. An absolute must-have classic that pairs perfectly with hot rice and ghee.', 
    299.00, 
    'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=800', 
    ARRAY[]::TEXT[], 
    'active', TRUE, TRUE, TRUE, 4, ARRAY['gongura', 'sorrel leave', 'tangy', 'andhra']::TEXT[], 20, 4.8, 150
  ),
  (
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
    'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 
    'Sun-dried Tomato Pickle (Nimmakaya)', 
    'Rich red tomatoes sun-dried and pounded with premium spices to create a thick, flavorful gravy-like pickle. Excellent with dosas, idlis, and rice.', 
    279.00, 
    'https://images.unsplash.com/photo-1605658632669-bf054700d238?w=800', 
    ARRAY[]::TEXT[], 
    'active', TRUE, TRUE, TRUE, 3, ARRAY['tomato', 'breakfast', 'tangy']::TEXT[], 10, 4.6, 95
  ),

  -- Non-Veg Pickles
  (
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 
    'Nati Kodi Pachadi (Country Chicken)', 
    'Tender, boneless chunks of country chicken deeply marinated and fried in traditional Andhra masalas. A rich, spicy, and irresistible meat pickle for non-veg lovers.', 
    549.00, 
    'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800', 
    ARRAY[]::TEXT[], 
    'active', FALSE, FALSE, TRUE, 5, ARRAY['chicken', 'non-veg', 'spicy', 'premium']::TEXT[], 30, 4.9, 210
  ),
  (
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 
    'Godavari Royyala Pachadi (Prawn)', 
    'Freshly caught Godavari prawns cleaned, fried crisp, and tossed in our secret coastal spice blend. An absolute delicacy packed with flavor.', 
    649.00, 
    'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800', 
    ARRAY[]::TEXT[], 
    'active', FALSE, FALSE, TRUE, 4, ARRAY['prawn', 'seafood', 'godavari', 'premium']::TEXT[], 30, 4.8, 175
  ),

  -- Podis
  (
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', 
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
    'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 
    'Traditional Kandi Podi (Gun Powder)', 
    'Roasted to perfection, our Kandi Podi is a nutritious blend of toor dal, chana dal, cumin, and red chillies. The ultimate comfort food when mixed with hot rice and ghee.', 
    199.00, 
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800', 
    ARRAY[]::TEXT[], 
    'active', TRUE, TRUE, FALSE, 2, ARRAY['podi', 'dal', 'comfort food', 'ghee']::TEXT[], 0, 4.9, 305
  ),
  (
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08', 
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
    'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 
    'Karivepaku Podi (Curry Leaf)', 
    'A highly aromatic and healthy spice blend made with freshly shade-dried curry leaves, garlic, and lentils. Known for promoting good health while delivering excellent taste.', 
    189.00, 
    'https://images.unsplash.com/photo-1615486171448-4ff6c55cc9a8?w=800', 
    ARRAY[]::TEXT[], 
    'active', TRUE, TRUE, TRUE, 3, ARRAY['healthy', 'curry leaf', 'aromatic', 'podi']::TEXT[], 0, 4.7, 120
  )
ON CONFLICT (id) DO NOTHING;

-- ─── Variants (Sizes/Weights) ────────────────────────────────────────────────
INSERT INTO variants (id, product_id, name, price, is_available) VALUES
  -- Avakaya Variants
  (uuid_generate_v4(), 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', '250g Jar', 199.00, TRUE),
  (uuid_generate_v4(), 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', '500g Jar', 349.00, TRUE),
  (uuid_generate_v4(), 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', '1kg Family Pack', 649.00, TRUE),

  -- Bellam Avakaya Variants
  (uuid_generate_v4(), 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '250g Jar', 189.00, TRUE),
  (uuid_generate_v4(), 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '500g Jar', 329.00, TRUE),

  -- Gongura Variants
  (uuid_generate_v4(), 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', '250g Jar', 169.00, TRUE),
  (uuid_generate_v4(), 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', '500g Jar', 299.00, TRUE),

  -- Chicken Pickle Variants
  (uuid_generate_v4(), 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', '250g Jar', 299.00, TRUE),
  (uuid_generate_v4(), 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', '500g Jar', 549.00, TRUE),
  (uuid_generate_v4(), 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', '1kg Special', 1049.00, TRUE),

  -- Prawn Pickle Variants
  (uuid_generate_v4(), 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', '250g Jar', 349.00, TRUE),
  (uuid_generate_v4(), 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', '500g Jar', 649.00, TRUE),

  -- Kandi Podi Variants
  (uuid_generate_v4(), 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', '250g Pouch', 119.00, TRUE),
  (uuid_generate_v4(), 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', '500g Jar', 199.00, TRUE),

  -- Karivepaku Podi Variants
  (uuid_generate_v4(), 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08', '250g Pouch', 109.00, TRUE),
  (uuid_generate_v4(), 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08', '500g Jar', 189.00, TRUE)
;

-- ─── Sample Reviews ──────────────────────────────────────────────────────────
INSERT INTO reviews (id, user_id, product_id, rating, comment) VALUES
  (uuid_generate_v4(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 5, 'Absolutely incredible taste. Reminds me exactly of my grandmother’s Avakaya! The oil quality is top-notch.'),
  (uuid_generate_v4(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 5, 'The chicken pieces are so tender and the masala is extremely flavorful. A bit spicy but I love it!'),
  (uuid_generate_v4(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', 5, 'Best Kandi Podi ever. Period. Just add hot rice and ghee.')
ON CONFLICT (user_id, product_id) DO NOTHING;
