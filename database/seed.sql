-- ============================================================
-- PEHALWAN KARAHI & DERAGHAR — HOSTINGER DATABASE SEED DATA
-- Exported from store.json (Menu and Settings ONLY)
-- Run this script in phpMyAdmin on Hostinger MySQL
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Categories
INSERT INTO categories (id, slug, name, sort_order, is_active) VALUES
  (1, 'karahi', 'Special Karahi & Handi', 1, 1),
  (2, 'bbq', 'Charcoal Bar B Q', 2, 1),
  (3, 'rice', 'Matka Dum Biryani & Pulao', 3, 1),
  (4, 'tandoor', 'Garam Tandoor & Desserts', 4, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), sort_order=VALUES(sort_order);

-- Dishes
INSERT INTO dishes (id, category_id, name, tag, price, rating, description, image_url, is_available, sort_order) VALUES
  (1, 1, 'Peshawari Charsi Mutton Karahi', 'Bestseller • Full 1 Kg', 2850, '4.9', 'Tender dumbay ka gosht cooked in pure animal fat/desi ghee, black pepper, tomatoes & green chilies.', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80', 1, 1),
  (2, 1, 'Lahori Achari Chicken Karahi', 'Desi Ghee Tarka', 1650, '4.8', 'Wok-seared organic chicken tossed in tangy roasted fennel, kalonji, tomatoes & fresh ginger juliennes.', 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80', 1, 2),
  (3, 1, 'Mughlai Chicken Makhni Handi', 'Boneless Claypot', 1750, '4.9', 'Velvety butter, cream, and roasted cashew gravy slow-simmered in a traditional clay handi.', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80', 1, 3),
  (4, 2, 'Angara Reshmi Seekh Kebab (6 Pcs)', 'Live Charcoal', 1150, '4.9', 'Melt-in-mouth minced beef & chicken skewers infused with fresh coriander, green chili & smoky butter.', 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80', 1, 4),
  (5, 2, 'Koyla Chicken Malai Boti (12 Pcs)', 'Creamy & Smoky', 1250, '4.8', 'Boneless chicken cubes marinated in fresh balai, white pepper, green cardamom & grilled over coals.', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80', 1, 5),
  (6, 2, 'Karachi Burns Road Beef Bihari Boti', 'Mustard Oil & Spice', 1450, '4.9', 'Thin beef strips marinated in raw papaya, fried onions, and aromatic Bihari masala served with puri paratha.', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80', 1, 6),
  (7, 3, 'Matka Sindhi Chicken Dum Biryani', 'Sealed Clay Matka', 850, '4.9', 'Long-grain aged basmati rice layered with spicy chicken, dried plums (aloo bukhara), mint & saffron.', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80', 1, 7),
  (8, 3, 'Kabuli Afghani Mutton Pulao', 'Shank Meat & Raisins', 1550, '4.8', 'Fragrant yakhni rice topped with caramelized carrots, black raisins, almonds & slow-braised mutton.', 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&q=80', 1, 8),
  (9, 4, 'Tandoori Garlic & Kalonji Roghni Naan', 'Desi Makhan Brushed', 180, '5.0', 'Pillow-soft clay oven flatbread topped with roasted garlic, sesame seeds, and warm desi makhan.', 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=600&q=80', 1, 9),
  (10, 4, 'Garma Garam Gulab Jamun & Rabri', 'Shahi Meetha', 550, '4.9', 'Warm khoya gulab jamuns drowned in thick cardamom-saffron rabri and crushed pistachios.', 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?auto=format&fit=crop&w=600&q=80', 1, 10)
ON DUPLICATE KEY UPDATE name=VALUES(name), price=VALUES(price), description=VALUES(description), image_url=VALUES(image_url);

-- Settings
INSERT INTO settings (
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
  'Pehalwan Karahi & DeraGhar'
) ON DUPLICATE KEY UPDATE
  restaurant_name=VALUES(restaurant_name),
  tagline=VALUES(tagline),
  phone=VALUES(phone),
  whatsapp=VALUES(whatsapp),
  address=VALUES(address),
  branches=VALUES(branches),
  timings=VALUES(timings),
  delivery_fee=VALUES(delivery_fee),
  min_order=VALUES(min_order),
  delivery_estimate=VALUES(delivery_estimate),
  is_accepting_orders=VALUES(is_accepting_orders),
  announcement_enabled=VALUES(announcement_enabled),
  opening_time=VALUES(opening_time),
  closing_time=VALUES(closing_time),
  free_delivery_threshold=VALUES(free_delivery_threshold);
  announcement=VALUES(announcement);

SET FOREIGN_KEY_CHECKS = 1;
