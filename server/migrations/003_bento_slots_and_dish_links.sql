-- Migration 003: Add missing BentoGrid slots and link default slots to live menu dishes by name

-- 1. Insert missing BentoGrid slots (so all 5 bento tiles have slots in the CMS)
INSERT IGNORE INTO site_slots (slot_key, section, label, alt_text, fallback_url, sort_order) VALUES
  ('bento.deal', 'BentoGrid', 'Bento Weekend Dawat Deal', 'Desi Shinwari Mutton Karahi', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80', 9),
  ('bento.sub3', 'BentoGrid', 'Bento Sub-Tile 3 (Bottom-Left)', 'Mutton Muscles (Machli) Karahi', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80', 11);

-- 2. Link default slots to dishes by matching dish name
-- Mutton Karahi slots -> Peshawari Charsi Mutton Karahi
UPDATE site_slots s
JOIN dishes d ON d.name LIKE '%Mutton Karahi%'
SET s.dish_id = d.id
WHERE s.slot_key IN ('hero.plate1', 'strip.1', 'bento.deal');

-- Chicken Karahi slots -> Lahori Achari Chicken Karahi
UPDATE site_slots s
JOIN dishes d ON d.name LIKE '%Chicken Karahi%'
SET s.dish_id = d.id
WHERE s.slot_key IN ('hero.plate2', 'strip.2');

-- Matka Handi slot -> Mughlai Chicken Makhni Handi
UPDATE site_slots s
JOIN dishes d ON d.name LIKE '%Handi%'
SET s.dish_id = d.id
WHERE s.slot_key = 'bento.sub1';
