-- Migration 004: Add logo_url and favicon_url to settings table

ALTER TABLE settings 
  ADD COLUMN IF NOT EXISTS logo_url VARCHAR(1000) NULL AFTER payment_account_title,
  ADD COLUMN IF NOT EXISTS favicon_url VARCHAR(1000) NULL AFTER logo_url;
