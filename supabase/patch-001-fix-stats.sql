-- patch-001-fix-stats.sql
-- Run this in Supabase SQL Editor to fix:
-- 1. lowest_price / retailers_count not updating after scraper runs
-- 2. Adds refresh_product_stats() RPC used by match-products.js

-- ─────────────────────────────────────────────────────────────────
-- Function: refresh product stats from current_prices
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION refresh_product_stats()
RETURNS void AS $$
BEGIN
  UPDATE products p
  SET
    lowest_price    = sub.min_price,
    retailers_count = sub.cnt,
    updated_at      = NOW()
  FROM (
    SELECT
      product_id,
      MIN(price_usd) AS min_price,
      COUNT(*)       AS cnt
    FROM current_prices
    WHERE in_stock = true
    GROUP BY product_id
  ) sub
  WHERE p.id = sub.product_id;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────────────────────────
-- Trigger: auto-update product stats whenever current_prices changes
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION trg_update_product_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the affected product's lowest_price and retailers_count
  UPDATE products
  SET
    lowest_price = (
      SELECT MIN(price_usd) FROM current_prices
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        AND in_stock = true
    ),
    retailers_count = (
      SELECT COUNT(*) FROM current_prices
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        AND in_stock = true
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_current_prices_stats ON current_prices;
CREATE TRIGGER trg_current_prices_stats
  AFTER INSERT OR UPDATE OR DELETE ON current_prices
  FOR EACH ROW EXECUTE FUNCTION trg_update_product_stats();

-- ─────────────────────────────────────────────────────────────────
-- One-time backfill: update all products right now
-- ─────────────────────────────────────────────────────────────────
SELECT refresh_product_stats();
