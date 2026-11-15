-- Migration 002: Backfill image_media_id in dishes from image_url values matching '/api/media/<id>'

UPDATE dishes
SET image_media_id = CAST(SUBSTRING_INDEX(SUBSTRING(image_url, 12), '?', 1) AS UNSIGNED)
WHERE image_media_id IS NULL
  AND image_url LIKE '/api/media/%';
