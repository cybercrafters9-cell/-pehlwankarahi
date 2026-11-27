-- Migration 001: Initial Schema for Pehlwan Karahi CMS & MySQL Store
-- Character set utf8mb4, Engine InnoDB, compatible with MySQL 5.7/8 and MariaDB 10.x

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  payment_account_title VARCHAR(255) NOT NULL DEFAULT 'Pehlwan Karahi'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

CREATE TABLE IF NOT EXISTS loyalty_passes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  phone VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  tier VARCHAR(50) NOT NULL DEFAULT 'Shahi Member',
  discount_percent INT NOT NULL DEFAULT 15,
  activated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

-- Seed Default Settings Row (id = 1) if not already present
INSERT INTO settings (
  id, restaurant_name, tagline, phone, whatsapp, landline, email,
  address, branches, timings, delivery_fee, min_order, delivery_estimate,
  announcement, is_live_wok_active, is_accepting_orders, announcement_enabled,
  opening_time, closing_time, free_delivery_threshold,
  easypaisa_number, jazzcash_number, payment_account_title
) VALUES (
  1,
  'Pehlwan Karahi',
  'Authentic Pakistani Karahi, Charcoal Bar B Q & Desi Handi',
  '0300-1234567',
  '0321-9876543',
  '041-8899221',
  'info@pehlwankarahi.com',
  'Main Boulevard, Kohinoor City / Canal Road Rooftop, Faisalabad, Pakistan',
  '["Gulberg / Kohinoor City Branch", "Canal Road Rooftop Family Dera", "Express Takeaway & Cloud Kitchen"]',
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
  'Pehlwan Karahi & DeraGhar'
) ON DUPLICATE KEY UPDATE id=1;

-- Seed Initial 13 Homepage Site Slots
INSERT INTO site_slots (slot_key, section, label, alt_text, fallback_url, sort_order) VALUES
  ('hero.plate1', 'Hero', 'Hero Plate 1 (Top-Left)', 'Mutton Karahi', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80', 1),
  ('hero.plate2', 'Hero', 'Hero Plate 2 (Top-Right)', 'Chicken Karahi', 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80', 2),
  ('hero.plate3', 'Hero', 'Hero Plate 3 (Bottom-Center)', 'Mutton Chops Karahi', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85', 3),
  ('strip.1', 'FeaturedStrip', 'Featured Strip 1', 'Mutton Karahi', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=300&q=80', 4),
  ('strip.2', 'FeaturedStrip', 'Featured Strip 2', 'Chicken Karahi', 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=300&q=80', 5),
  ('strip.3', 'FeaturedStrip', 'Featured Strip 3', 'Mutton Chops Karahi', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80', 6),
  ('strip.4', 'FeaturedStrip', 'Featured Strip 4', 'Mutton Muscles (Machli) Karahi', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=300&q=80', 7),
  ('bento.main', 'BentoGrid', 'Bento Main Overhead Platter', 'Royal Pakistani BBQ & Karahi Feast', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=85', 8),
  ('bento.sub1', 'BentoGrid', 'Bento Sub-Tile 1 (Top-Left)', 'Matka Handi & Garlic Naan', 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80', 9),
  ('bento.sub4', 'BentoGrid', 'Bento Sub-Tile 4 (Bottom-Right)', 'Boneless Chicken Karahi', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80', 10),
  ('editorial.main', 'EditorialShowcase', 'Editorial Showcase Tawa Platter', 'Shami & Seekh Kabab Platter', 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80', 11),
  ('reservation.main', 'ReservationSection', 'Reservation Banner Showcase', 'Sizzling Charcoal Sajji & Lemon Chops', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=85', 12),
  ('video.poster', 'VideoModal', 'Video Modal Poster', 'Live Charcoal Grill', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=80', 13)
ON DUPLICATE KEY UPDATE fallback_url=VALUES(fallback_url);
