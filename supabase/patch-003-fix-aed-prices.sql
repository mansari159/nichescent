-- patch-003-fix-aed-prices.sql
-- Fixes existing AED prices that were stored as USD by mistake
-- Run once in Supabase SQL Editor

-- Convert AED prices to USD (1 AED = 0.2723 USD)
UPDATE current_prices
SET price_usd = ROUND(price * 0.2723, 2)
WHERE currency = 'AED';

-- Also fix SAR if any
UPDATE current_prices
SET price_usd = ROUND(price * 0.2667, 2)
WHERE currency = 'SAR';

-- Refresh product lowest_price after the fix
SELECT refresh_product_stats();

-- Verify
SELECT currency, COUNT(*), MIN(price_usd), MAX(price_usd), AVG(price_usd)
FROM current_prices
GROUP BY currency
ORDER BY currency;
