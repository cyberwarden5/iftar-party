-- Add manually_adjusted column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS manually_adjusted BOOLEAN DEFAULT NULL;

-- Update existing products to have manually_adjusted as NULL
UPDATE products SET manually_adjusted = NULL WHERE manually_adjusted IS NOT NULL;
