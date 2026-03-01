-- patch-004-fix-cross-brand-prices.sql
-- Removes cross-brand price entries (e.g. Afnan price on a Lattafa product)
-- and resets those listings to 'pending' so the improved matcher can re-process them
-- Run in Supabase SQL Editor

-- Step 1: Find and delete cross-brand current_prices
-- (where the retailer's brand doesn't match the product's brand)
DELETE FROM current_prices cp
WHERE EXISTS (
  SELECT 1
  FROM products p
  JOIN brands pb ON pb.id = p.brand_id
  JOIN retailers r ON r.id = cp.retailer_id
  JOIN brands rb ON rb.name = r.name  -- retailer slug matches a brand name
  WHERE cp.product_id = p.id
    AND pb.id != rb.id               -- brands don't match
);

-- Step 2: Reset matched listings back to pending so matcher re-processes them
UPDATE scraper_listings
SET match_status = 'pending',
    matched_product_id = NULL,
    match_confidence = NULL
WHERE match_status = 'matched';

-- Step 3: Refresh product stats
SELECT refresh_product_stats();

-- Verify counts
SELECT
  (SELECT COUNT(*) FROM current_prices) AS prices_remaining,
  (SELECT COUNT(*) FROM scraper_listings WHERE match_status = 'pending') AS pending_listings,
  (SELECT COUNT(*) FROM products WHERE lowest_price IS NOT NULL) AS products_with_price;
