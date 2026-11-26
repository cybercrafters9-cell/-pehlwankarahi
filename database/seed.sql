-- first import only
-- ============================================================
-- PEHLWAN KARAHI & DERAGHAR — HOSTINGER DATABASE SEED DATA
-- Exported from MySQL Database (Categories, Menu, Settings & Slots)
-- Run this script in phpMyAdmin on Hostinger MySQL
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Categories (INSERT IGNORE so admin edits are never overwritten)
INSERT IGNORE INTO categories (id, slug, name, sort_order, is_active) VALUES
  (1, 'karahi', 'Special Karahi & Handi', 1, 1),
  (2, 'bbq', 'Charcoal Bar B Q', 2, 1),
  (3, 'rice', 'Matka Dum Biryani & Pulao', 3, 1),
  (4, 'tandoor', 'Garam Tandoor & Desserts', 4, 1);

-- Dishes (INSERT IGNORE so admin edits are never overwritten)
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

-- Link slots to dishes by name (idempotent; only where dish_id is null)
UPDATE site_slots
SET dish_id = (SELECT id FROM dishes WHERE name LIKE '%Mutton Karahi%' ORDER BY id LIMIT 1)
WHERE slot_key IN ('hero.plate1', 'strip.1', 'bento.deal')
  AND dish_id IS NULL;

UPDATE site_slots
SET dish_id = (SELECT id FROM dishes WHERE name LIKE '%Chicken Karahi%' ORDER BY id LIMIT 1)
WHERE slot_key IN ('hero.plate2', 'strip.2')
  AND dish_id IS NULL;

UPDATE site_slots
SET dish_id = (SELECT id FROM dishes WHERE name LIKE '%Handi%' ORDER BY id LIMIT 1)
WHERE slot_key = 'bento.sub1'
  AND dish_id IS NULL;

-- Settings (only inserted when missing)
INSERT IGNORE INTO settings (
  id, restaurant_name, tagline, phone, whatsapp, landline, email,
  address, branches, timings, delivery_fee, min_order, delivery_estimate,
  announcement, is_live_wok_active, is_accepting_orders, announcement_enabled,
  opening_time, closing_time, free_delivery_threshold,
  easypaisa_number, jazzcash_number, payment_account_title
) VALUES (
  1,
  'Pehlwan Karahi & DeraGhar',
  'Authentic Pakistani Karahi, Charcoal Bar B Q & Desi Handi',
  '0300-1234567',
  '0321-9876543',
  '041-8899221',
  'info@pehlwankarahi.com',
  'Main Boulevard, Kohinoor City / Canal Road Rooftop, Faisalabad, Pakistan',
  '[\"Gulberg / Kohinoor City Branch\",\"Canal Road Rooftop Family Dera\",\"Express Takeaway & Cloud Kitchen\"]',
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
);

-- Site Slots (only inserted when missing; linked to real dishes by name match where possible)
INSERT IGNORE INTO site_slots (slot_key, section, label, alt_text, fallback_url, dish_id, sort_order) VALUES
  ('hero.plate1', 'Hero', 'Hero Plate 1 (Top-Left)', 'Mutton Karahi', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80', NULL, 1),
  ('hero.plate2', 'Hero', 'Hero Plate 2 (Top-Right)', 'Chicken Karahi', 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80', NULL, 2),
  ('hero.plate3', 'Hero', 'Hero Plate 3 (Bottom-Center)', 'Mutton Chops Karahi', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85', NULL, 3),
  ('strip.1', 'FeaturedStrip', 'Featured Strip 1', 'Mutton Karahi', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=300&q=80', NULL, 4),
  ('strip.2', 'FeaturedStrip', 'Featured Strip 2', 'Chicken Karahi', 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=300&q=80', NULL, 5),
  ('strip.3', 'FeaturedStrip', 'Featured Strip 3', 'Mutton Chops Karahi', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80', NULL, 6),
  ('strip.4', 'FeaturedStrip', 'Featured Strip 4', 'Mutton Muscles (Machli) Karahi', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=300&q=80', NULL, 7),
  ('bento.main', 'BentoGrid', 'Bento Main Overhead Platter', 'Royal Pakistani BBQ & Karahi Feast', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=85', NULL, 8),
  ('bento.deal', 'BentoGrid', 'Bento Weekend Dawat Deal', 'Desi Shinwari Mutton Karahi', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80', NULL, 9),
  ('bento.sub1', 'BentoGrid', 'Bento Sub-Tile 1 (Top-Left)', 'Matka Handi & Garlic Naan', 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80', NULL, 10),
  ('bento.sub3', 'BentoGrid', 'Bento Sub-Tile 3 (Bottom-Left)', 'Mutton Muscles (Machli) Karahi', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80', NULL, 11),
  ('bento.sub4', 'BentoGrid', 'Bento Sub-Tile 4 (Bottom-Right)', 'Boneless Chicken Karahi', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80', NULL, 12),
  ('editorial.main', 'EditorialShowcase', 'Editorial Showcase Tawa Platter', 'Shami & Seekh Kabab Platter', 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80', NULL, 13),
  ('reservation.main', 'ReservationSection', 'Reservation Banner Showcase', 'Sizzling Charcoal Sajji & Lemon Chops', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=85', NULL, 14),
  ('video.poster', 'VideoModal', 'Video Modal Poster', 'Live Charcoal Grill', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=80', NULL, 15);

SET FOREIGN_KEY_CHECKS = 1;
