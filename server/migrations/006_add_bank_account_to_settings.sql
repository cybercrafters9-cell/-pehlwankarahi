-- Migration 006: Add bank transfer details to settings table

ALTER TABLE settings 
  ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255) NULL AFTER payment_account_title,
  ADD COLUMN IF NOT EXISTS bank_branch VARCHAR(255) NULL AFTER bank_name,
  ADD COLUMN IF NOT EXISTS bank_account_title VARCHAR(255) NULL AFTER bank_branch,
  ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(100) NULL AFTER bank_account_title,
  ADD COLUMN IF NOT EXISTS bank_iban VARCHAR(100) NULL AFTER bank_account_number;

UPDATE settings SET
  bank_name = IFNULL(NULLIF(bank_name, ''), 'Dubai Islamic Bank'),
  bank_branch = IFNULL(NULLIF(bank_branch, ''), 'Riphah Branch, Faisalabad'),
  bank_account_title = IFNULL(NULLIF(bank_account_title, ''), 'Muhammad Zuber'),
  bank_account_number = IFNULL(NULLIF(bank_account_number, ''), '0792749002'),
  bank_iban = IFNULL(NULLIF(bank_iban, ''), 'PK90DUIB0000000792749002')
WHERE id = 1;
