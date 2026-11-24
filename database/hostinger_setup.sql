-- ============================================================
-- PEHALWAN KARAHI & DERAGHAR — COMPLETE HOSTINGER ALL-IN-ONE SQL
-- Imports all tables, default admin, initial menu, and settings.
-- Run this directly in phpMyAdmin on Hostinger MySQL.
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Schema Migrations Table
CREATE TABLE IF NOT EXISTS schema_migrations (
  version INT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO schema_migrations (version, name) VALUES
  (1, '001_initial_schema.sql'),
  (2, '002_backfill_dish_media_ids.sql'),
  (3, '003_bento_slots_and_dish_links.sql');

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Media Storage Table
CREATE TABLE IF NOT EXISTS media (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL DEFAULT '',
  mime VARCHAR(50) NOT NULL,
  size INT NOT NULL,
  hash_sha256 VARCHAR(64) NULL,
  data MEDIUMBLOB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_media_hash (hash_sha256)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Dishes Table
CREATE TABLE IF NOT EXISTS dishes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  tag VARCHAR(255) NOT NULL DEFAULT '',
  price INT NOT NULL,
  rating VARCHAR(10) NOT NULL DEFAULT '4.9',
  description TEXT NOT NULL,
  image_media_id BIGINT NULL,
  image_url VARCHAR(1000) NULL,
  is_available TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_dishes_category_sort (category_id, sort_order),
  CONSTRAINT fk_dishes_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT,
  CONSTRAINT fk_dishes_media FOREIGN KEY (image_media_id) REFERENCES media (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Site Presentation Slots
CREATE TABLE IF NOT EXISTS site_slots (
  slot_key VARCHAR(60) PRIMARY KEY,
  section VARCHAR(100) NOT NULL,
  label VARCHAR(255) NOT NULL,
  alt_text VARCHAR(255) NOT NULL,
  fallback_url VARCHAR(1000) NOT NULL,
  media_id BIGINT NULL,
  dish_id INT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_site_slots_media FOREIGN KEY (media_id) REFERENCES media (id) ON DELETE SET NULL,
  CONSTRAINT fk_site_slots_dish FOREIGN KEY (dish_id) REFERENCES dishes (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Restaurant Settings Table
CREATE TABLE IF NOT EXISTS settings (
  id TINYINT PRIMARY KEY,
  restaurant_name VARCHAR(255) NOT NULL,
  tagline VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  whatsapp VARCHAR(50) NOT NULL,
  landline VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  address VARCHAR(500) NOT NULL,
  branches TEXT NOT NULL,
  timings VARCHAR(255) NOT NULL,
  delivery_fee INT NOT NULL DEFAULT 0,
  min_order INT NOT NULL DEFAULT 500,
  delivery_estimate VARCHAR(100) NOT NULL,
  announcement TEXT NOT NULL,
  is_live_wok_active TINYINT(1) NOT NULL DEFAULT 1,
  is_accepting_orders TINYINT(1) NOT NULL DEFAULT 1,
  announcement_enabled TINYINT(1) NOT NULL DEFAULT 1,
  opening_time VARCHAR(50) NOT NULL DEFAULT '12:00 PM',
  closing_time VARCHAR(50) NOT NULL DEFAULT '02:00 AM',
  free_delivery_threshold INT NOT NULL DEFAULT 3000,
  easypaisa_number VARCHAR(50) NOT NULL DEFAULT '03001234567',
  jazzcash_number VARCHAR(50) NOT NULL DEFAULT '03219876543',
  payment_account_title VARCHAR(255) NOT NULL DEFAULT 'Pehalwan Karahi & DeraGhar',
  logo_url VARCHAR(1000) NULL,
  favicon_url VARCHAR(1000) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  address TEXT NOT NULL,
  subtotal INT NOT NULL,
  delivery_fee INT NOT NULL DEFAULT 0,
  discount INT NOT NULL DEFAULT 0,
  total INT NOT NULL,
  spice_level VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'preparing',
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  transaction_id VARCHAR(100) NULL,
  estimated_delivery_mins INT NOT NULL DEFAULT 35,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_orders_created_at (created_at),
  INDEX idx_orders_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  dish_id INT NULL,
  name VARCHAR(255) NOT NULL,
  price INT NOT NULL,
  qty INT NOT NULL,
  image_url VARCHAR(1000) NOT NULL,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Table Reservations
CREATE TABLE IF NOT EXISTS reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  guests INT NOT NULL,
  time_slot VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reservations_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Loyalty VIP Passes
CREATE TABLE IF NOT EXISTS loyalty_passes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  phone VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  tier VARCHAR(50) NOT NULL DEFAULT 'Shahi Member',
  discount_percent INT NOT NULL DEFAULT 15,
  activated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'superadmin',
  last_login TIMESTAMP NULL,
  token_version INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Insert Default Master Admin (pehlwankarahi / CyberCrafters@.90)
INSERT INTO admin_users (username, email, password_hash, name, role, token_version)
VALUES ('pehlwankarahi', 'admin@pehalwankarahi.com', '$2b$10$wu6ZHsMWUtzt7Nlsin5v5e/zrJzKqhqW7UNLu0O77ZsieWTfc.7c.', 'Master Pehalwan', 'superadmin', 0)
ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash);

-- 13. Categories Seed
INSERT IGNORE INTO categories (id, slug, name, sort_order, is_active) VALUES
  (1, 'karahi', 'Special Karahi & Handi', 1, 1),
  (2, 'bbq', 'Charcoal Bar B Q', 2, 1),
  (3, 'rice', 'Matka Dum Biryani & Pulao', 3, 1),
  (4, 'tandoor', 'Garam Tandoor & Desserts', 4, 1);

-- 14. Dishes Seed
INSERT IGNORE INTO dishes (id, category_id, name, tag, price, rating, description, image_url, is_available, sort_order) VALUES
  (1, 1, 'Peshawari Charsi Mutton Karahi', 'Bestseller • Full 1 Kg', 2850, '4.9', 'Tender dumbay ka gosht cooked in pure animal fat/desi ghee, black pepper, tomatoes & green chilies.', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80', 1, 1),
  (2, 1, 'Lahori Achari Chicken Karahi', 'Desi Ghee Tarka', 1650, '4.8', 'Wok-seared organic chicken tossed in tangy roasted fennel, kalonji, tomatoes & fresh ginger juliennes.', 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80', 1, 2),
  (3, 1, 'Mughlai Chicken Makhni Handi', 'Boneless Claypot', 1750, '4.9', 'Velvety butter, cream, and roasted cashew gravy slow-simmered in a traditional clay handi.', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80', 1, 3),
  (4, 2, 'Angara Reshmi Seekh Kebab (6 Pcs)', 'Live Charcoal', 1150, '4.9', 'Melt-in-mouth minced beef & chicken skewers infused with fresh coriander, green chili & smoky butter.', 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80', 1, 4),
  (5, 2, 'Koyla Chicken Malai Boti (12 Pcs)', 'Creamy & Smoky', 1250, '4.8', 'Boneless chicken cubes marinated in fresh balai, white pepper, green cardamom & grilled over coals.', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80', 1, 5),
  (6, 2, 'Karachi Burns Road Beef Bihari Boti', 'Mustard Oil & Spice', 1450, '4.9', 'Thin beef strips marinated in raw papaya, fried onions, and aromatic Bihari masala served with puri paratha.', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80', 1, 6),
  (7, 3, 'Matka Sindhi Chicken Dum Biryani', 'Sealed Clay Matka', 850, '4.9', 'Long-grain aged basmati rice layered with spicy chicken, dried plums (aloo bukhara), mint & saffron.', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80', 1, 7),
  (8, 3, 'Kabuli Afghani Mutton Pulao', 'Shank Meat & Raisins', 1550, '4.8', 'Fragrant yakhni rice topped with caramelized carrots, black raisins, almonds & slow-braised mutton.', 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&q=80', 1, 8),
  (9, 4, 'Tandoori Garlic & Kalonji Roghni Naan', 'Desi Makhan Brushed', 180, '5.0', 'Pillow-soft clay oven flatbread topped with roasted garlic, sesame seeds, and warm desi makhan.', 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=600&q=80', 1, 9),
  (10, 4, 'Garma Garam Gulab Jamun & Rabri', 'Shahi Meetha', 550, '4.9', 'Warm khoya gulab jamuns drowned in thick cardamom-saffron rabri and crushed pistachios.', 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?auto=format&fit=crop&w=600&q=80', 1, 10);

-- 15. Settings Seed
INSERT IGNORE INTO settings (
  id, restaurant_name, tagline, phone, whatsapp, landline, email,
  address, branches, timings, delivery_fee, min_order, delivery_estimate,
  announcement, is_live_wok_active, is_accepting_orders, announcement_enabled,
  opening_time, closing_time, free_delivery_threshold,
  easypaisa_number, jazzcash_number, payment_account_title
) VALUES (
  1,
  'Pehalwan Karahi & DeraGhar',
  'Authentic Pakistani Karahi, Charcoal Bar B Q & Desi Handi',
  '0300-1234567',
  '0321-9876543',
  '041-8899221',
  'info@pehalwankarahi.com',
  'Main Boulevard, Kohinoor City / Canal Road Rooftop, Faisalabad, Pakistan',
  '[\"Gulberg / Kohinoor City Branch\", \"Canal Road Rooftop Family Dera\", \"Express Takeaway & Cloud Kitchen\"]',
  '12:00 PM – 02:00 AM Daily',
  0,
  500,
  '28–35 mins',
  '🔥 Live Koyla Grill & Freshly slaughtered Halal Meat prepared in pure Desi Ghee!',
  1,
  1,
  1,
  '12:00 PM',
  '02:00 AM',
  3000,
  '03001234567',
  '03219876543',
  'Pehalwan Karahi & DeraGhar'
);

-- 16. Site Slots Seed
INSERT IGNORE INTO site_slots (slot_key, section, label, alt_text, fallback_url, dish_id, sort_order) VALUES
  ('hero.plate1', 'Hero', 'Hero Plate 1 (Top-Left)', 'Mutton Karahi', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80', 1, 1),
  ('hero.plate2', 'Hero', 'Hero Plate 2 (Top-Right)', 'Chicken Karahi', 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80', 2, 2),
  ('hero.plate3', 'Hero', 'Hero Plate 3 (Bottom-Center)', 'Mutton Chops Karahi', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85', NULL, 3),
  ('strip.1', 'FeaturedStrip', 'Featured Strip 1', 'Mutton Karahi', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=300&q=80', 1, 4),
  ('strip.2', 'FeaturedStrip', 'Featured Strip 2', 'Chicken Karahi', 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=300&q=80', 2, 5),
  ('strip.3', 'FeaturedStrip', 'Featured Strip 3', 'Mutton Chops Karahi', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80', NULL, 6),
  ('strip.4', 'FeaturedStrip', 'Featured Strip 4', 'Mutton Muscles (Machli) Karahi', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=300&q=80', NULL, 7),
  ('bento.main', 'BentoGrid', 'Bento Main Overhead Platter', 'Royal Pakistani BBQ & Karahi Feast', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=85', NULL, 8),
  ('bento.deal', 'BentoGrid', 'Bento Weekend Dawat Deal', 'Desi Shinwari Mutton Karahi', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80', 1, 9),
  ('bento.sub1', 'BentoGrid', 'Bento Sub-Tile 1 (Top-Left)', 'Matka Handi & Garlic Naan', 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80', 3, 10),
  ('bento.sub3', 'BentoGrid', 'Bento Sub-Tile 3 (Bottom-Left)', 'Mutton Muscles (Machli) Karahi', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80', NULL, 11),
  ('bento.sub4', 'BentoGrid', 'Bento Sub-Tile 4 (Bottom-Right)', 'Boneless Chicken Karahi', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80', NULL, 12),
  ('editorial.main', 'EditorialShowcase', 'Editorial Showcase Tawa Platter', 'Shami & Seekh Kabab Platter', 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80', NULL, 13),
  ('reservation.main', 'ReservationSection', 'Reservation Banner Showcase', 'Sizzling Charcoal Sajji & Lemon Chops', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=85', NULL, 14),
  ('video.poster', 'VideoModal', 'Video Modal Poster', 'Live Charcoal Grill', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=80', NULL, 15);

SET FOREIGN_KEY_CHECKS = 1;
