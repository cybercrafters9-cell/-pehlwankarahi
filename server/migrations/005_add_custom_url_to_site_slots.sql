-- Add custom_url column to site_slots to allow direct custom image URLs without requiring local media ID
ALTER TABLE site_slots 
ADD COLUMN IF NOT EXISTS custom_url VARCHAR(1000) NULL AFTER fallback_url;

-- Add bento.sub2 slot for the top-right Tradition Card if not present
INSERT IGNORE INTO site_slots (slot_key, section, label, alt_text, fallback_url, dish_id, sort_order) 
VALUES (
  'bento.sub2', 
  'BentoGrid', 
  'Bento Sub-Tile 2 (Top-Right Tradition Card)', 
  'Peshawari Tradition & Desi Ghee', 
  'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80', 
  NULL, 
  10
);
