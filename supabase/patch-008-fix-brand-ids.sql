-- patch-008-fix-brand-ids.sql
-- Fix products that were created with brand_id = NULL because the Shopify
-- vendor field didn't exactly match the brand name in the brands table.
-- Uses scraper_listings.matched_product_id + retailers.slug to infer the brand.
--
-- Run in Supabase SQL Editor, then re-run: npm run scrape && npm run match

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Show the damage first (review before running the UPDATEs)
-- ─────────────────────────────────────────────────────────────────────────────
SELECT
  r.slug  AS retailer,
  COUNT(DISTINCT p.id) AS orphaned_products
FROM products p
JOIN scraper_listings sl ON sl.matched_product_id = p.id
JOIN retailers r         ON sl.retailer_id = r.id
WHERE p.brand_id IS NULL
GROUP BY r.slug
ORDER BY orphaned_products DESC;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Fix each retailer → brand mapping
--    (retailer slug → brand slug, one UPDATE per brand)
-- ─────────────────────────────────────────────────────────────────────────────

-- Gissah
UPDATE products p
SET brand_id = (SELECT id FROM brands WHERE slug = 'gissah')
WHERE p.brand_id IS NULL
  AND EXISTS (
    SELECT 1
    FROM scraper_listings sl
    JOIN retailers r ON sl.retailer_id = r.id
    WHERE sl.matched_product_id = p.id
      AND r.slug = 'gissah'
  );

-- Assaf
UPDATE products p
SET brand_id = (SELECT id FROM brands WHERE slug = 'assaf')
WHERE p.brand_id IS NULL
  AND EXISTS (
    SELECT 1
    FROM scraper_listings sl
    JOIN retailers r ON sl.retailer_id = r.id
    WHERE sl.matched_product_id = p.id
      AND r.slug = 'assaf'
  );

-- Rasasi
UPDATE products p
SET brand_id = (SELECT id FROM brands WHERE slug = 'rasasi')
WHERE p.brand_id IS NULL
  AND EXISTS (
    SELECT 1
    FROM scraper_listings sl
    JOIN retailers r ON sl.retailer_id = r.id
    WHERE sl.matched_product_id = p.id
      AND r.slug = 'rasasi'
  );

-- Ajmal
UPDATE products p
SET brand_id = (SELECT id FROM brands WHERE slug = 'ajmal')
WHERE p.brand_id IS NULL
  AND EXISTS (
    SELECT 1
    FROM scraper_listings sl
    JOIN retailers r ON sl.retailer_id = r.id
    WHERE sl.matched_product_id = p.id
      AND r.slug = 'ajmal'
  );

-- Swiss Arabian
UPDATE products p
SET brand_id = (SELECT id FROM brands WHERE slug = 'swiss-arabian')
WHERE p.brand_id IS NULL
  AND EXISTS (
    SELECT 1
    FROM scraper_listings sl
    JOIN retailers r ON sl.retailer_id = r.id
    WHERE sl.matched_product_id = p.id
      AND r.slug = 'swiss-arabian'
  );

-- Al Haramain
UPDATE products p
SET brand_id = (SELECT id FROM brands WHERE slug = 'al-haramain')
WHERE p.brand_id IS NULL
  AND EXISTS (
    SELECT 1
    FROM scraper_listings sl
    JOIN retailers r ON sl.retailer_id = r.id
    WHERE sl.matched_product_id = p.id
      AND r.slug = 'al-haramain'
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Verify — should show 0 orphans for all patched retailers
-- ─────────────────────────────────────────────────────────────────────────────
SELECT
  b.name  AS brand,
  COUNT(p.id) AS products
FROM products p
JOIN brands b ON p.brand_id = b.id
WHERE b.slug IN ('gissah','assaf','rasasi','ajmal','swiss-arabian','al-haramain')
GROUP BY b.name
ORDER BY products DESC;
