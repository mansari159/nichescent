-- patch-011-country-corrections.sql
-- Fix incorrect country assignments and clarify brand origins.
-- ─────────────────────────────────────────────────────────────────────────────

-- Al Rehab is an Egyptian brand (Cairo), NOT Saudi
UPDATE brands SET country = 'EG' WHERE slug = 'al-rehab' OR LOWER(name) = 'al rehab';

-- Al Haramain main company is Saudi, but also has UAE operations.
-- Keep SA as primary origin (founded in Mecca).
-- No change needed unless you want AE.

-- Hind Al Oud is Bahraini (BH) — correct as-is
-- Amouage is Omani (OM) — correct as-is
-- Reef International is Kuwaiti (KW) — correct as-is

-- Gissah: scraper uses gissahuae.com but brand origin is Kuwait
-- Keep KW — UAE domain is just their international store
-- UPDATE brands SET country = 'AE' WHERE slug = 'gissah';  -- uncomment if you want AE

-- Armaf: manufactured in UAE, brand registered in UAE
-- AE is correct as-is

-- Kayali: founded by Huda Kattan (Iraqi-American), operated from Dubai
-- AE is correct as-is

-- ── Verify results ────────────────────────────────────────────────────────────
SELECT country, COUNT(*) AS brand_count
FROM brands
WHERE country IS NOT NULL
GROUP BY country
ORDER BY brand_count DESC;
