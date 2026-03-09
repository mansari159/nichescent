-- patch-015: Add extended columns to brands table
-- Run in Supabase SQL Editor: supabase.com → SQL Editor → New Query

ALTER TABLE brands
  ADD COLUMN IF NOT EXISTS hero_image_url   TEXT,
  ADD COLUMN IF NOT EXISTS founded_year     INTEGER,
  ADD COLUMN IF NOT EXISTS signature_style  TEXT,
  ADD COLUMN IF NOT EXISTS common_notes     TEXT[],
  ADD COLUMN IF NOT EXISTS instagram_url    TEXT,
  ADD COLUMN IF NOT EXISTS fragrance_count  INTEGER DEFAULT 0;

-- Keep products_count and fragrance_count in sync
-- (fragrance_count is an alias; products_count already exists)

COMMENT ON COLUMN brands.hero_image_url  IS 'Wide hero image URL for brand page header';
COMMENT ON COLUMN brands.founded_year    IS 'Year the brand was founded';
COMMENT ON COLUMN brands.signature_style IS 'One-line brand style description, e.g. "Oud-forward Khaleeji luxury"';
COMMENT ON COLUMN brands.common_notes    IS 'Array of common fragrance notes, e.g. {oud, rose, saffron}';
