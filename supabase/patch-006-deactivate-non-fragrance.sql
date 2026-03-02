-- patch-006-deactivate-non-fragrance.sql
-- Deactivate products that are clearly not fragrances
-- Run in Supabase SQL editor

UPDATE products
SET is_active = false
WHERE (
  name ILIKE '%sunglasses%'
  OR name ILIKE '%eyewear%'
  OR name ILIKE '% glasses%'
  OR name ILIKE '%air freshener%'
  OR name ILIKE '%air freshner%'
  OR name ILIKE '%freshener spray%'
  OR name ILIKE '%oil burner%'
  OR name ILIKE '%burner with%'
  OR name ILIKE '%with burner%'
  OR name ILIKE '%with free oil%'
  OR name ILIKE '%diffuser burner%'
  OR name ILIKE '%incense burner%'
  OR name ILIKE '% set |%'
  OR name ILIKE '%sublime set%'
  OR name ILIKE '%luxury set%'
  OR name ILIKE '%gift set%'
  OR name ILIKE '%gift box%'
  OR name ILIKE '%gift bag%'
  OR name ILIKE '%sample set%'
  OR name ILIKE '%discovery set%'
  OR name ILIKE '%hair perfume%'
  OR name ILIKE '%hair oil%'
  OR name ILIKE '%body wash%'
  OR name ILIKE '%shower gel%'
  OR name ILIKE '%body lotion%'
  OR name ILIKE '%hand cream%'
  OR name ILIKE '%body cream%'
  OR name ILIKE '%fabric spray%'
  OR name ILIKE '%carpet freshener%'
  OR name ILIKE '%laundry%'
  OR name ILIKE '%t-shirt%'
);

-- Check how many were deactivated
SELECT COUNT(*) as deactivated FROM products WHERE is_active = false;

-- Also check what's still active
SELECT COUNT(*) as still_active FROM products WHERE is_active = true;
