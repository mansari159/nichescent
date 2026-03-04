-- patch-010-mena-brands.sql
-- Seed comprehensive MENA fragrance brand catalog with country codes.
-- Uses ON CONFLICT (slug) DO UPDATE so existing brands get country set
-- if it's currently NULL, but won't overwrite an already-correct country.
-- Brands table: id, name, slug, country, region, description, logo_url,
--               website_url, products_count, created_at, updated_at
-- ─────────────────────────────────────────────────────────────────────────────

-- ── UAE (AE) ──────────────────────────────────────────────────────────────────
INSERT INTO brands (name, slug, country, region) VALUES
  ('Lattafa Perfumes',      'lattafa-perfumes',      'AE', 'MENA'),
  ('Fragrance World',       'fragrance-world',       'AE', 'MENA'),
  ('Gulf Orchid',           'gulf-orchid',           'AE', 'MENA'),
  ('Yas Perfumes',          'yas-perfumes',          'AE', 'MENA'),
  ('Kayali',                'kayali',                'AE', 'MENA'),
  ('Afnan Perfumes',        'afnan-perfumes',        'AE', 'MENA'),
  ('Maison Alhambra',       'maison-alhambra',       'AE', 'MENA'),
  ('Al Wataniah',           'al-wataniah',           'AE', 'MENA'),
  ('My Perfumes',           'my-perfumes',           'AE', 'MENA'),
  ('Armaf',                 'armaf',                 'AE', 'MENA'),
  ('Paris Corner',          'paris-corner',          'AE', 'MENA'),
  ('Zimaya',                'zimaya',                'AE', 'MENA'),
  ('Manasik',               'manasik',               'AE', 'MENA'),
  ('Khalis Perfumes',       'khalis-perfumes',       'AE', 'MENA'),
  ('Milestone Perfumes',    'milestone-perfumes',    'AE', 'MENA'),
  ('Emper',                 'emper',                 'AE', 'MENA'),
  ('Ard Al Zaafaran',       'ard-al-zaafaran',       'AE', 'MENA'),
  ('Arabiyat Mestamem',     'arabiyat-mestamem',     'AE', 'MENA'),
  ('Flavia Perfumes',       'flavia-perfumes',       'AE', 'MENA'),
  ('Camion Blanc',          'camion-blanc',          'AE', 'MENA'),
  ('Al Fares',              'al-fares',              'AE', 'MENA'),
  ('Otoori',                'otoori',                'AE', 'MENA')
ON CONFLICT (slug) DO UPDATE
  SET country = EXCLUDED.country
  WHERE brands.country IS NULL;

-- ── Saudi Arabia (SA) ─────────────────────────────────────────────────────────
INSERT INTO brands (name, slug, country, region) VALUES
  ('Abdul Samad Al Qurashi', 'abdul-samad-al-qurashi', 'SA', 'MENA'),
  ('Deray',                  'deray',                  'SA', 'MENA'),
  ('Taif Al Emarat',         'taif-al-emarat',         'SA', 'MENA'),
  ('Surrati',                'surrati',                'SA', 'MENA'),
  ('Anfasic Dokhoon',        'anfasic-dokhoon',        'SA', 'MENA'),
  ('Royal Perfumes',         'royal-perfumes',         'SA', 'MENA'),
  ('Aseel',                  'aseel',                  'SA', 'MENA'),
  ('Maison Asrar',           'maison-asrar',           'SA', 'MENA'),
  ('Ahmed Al Maghribi',      'ahmed-al-maghribi',      'SA', 'MENA'),
  ('Al Jazeera Perfumes',    'al-jazeera-perfumes',    'SA', 'MENA'),
  ('Naseem',                 'naseem',                 'SA', 'MENA'),
  ('Mutamayez',              'mutamayez',              'SA', 'MENA'),
  ('Al Rehab',               'al-rehab',               'SA', 'MENA'),
  ('Al Nuaim',               'al-nuaim',               'SA', 'MENA')
ON CONFLICT (slug) DO UPDATE
  SET country = EXCLUDED.country
  WHERE brands.country IS NULL;

-- ── Kuwait (KW) ───────────────────────────────────────────────────────────────
INSERT INTO brands (name, slug, country, region) VALUES
  ('Reef International',    'reef-international',    'KW', 'MENA'),
  ('Bujirami',              'bujirami',              'KW', 'MENA'),
  ('J.',                    'j-perfumes',            'KW', 'MENA'),
  ('Khasab',                'khasab',                'KW', 'MENA'),
  ('Al Shareef Oudh',       'al-shareef-oudh',       'KW', 'MENA'),
  ('Oud Milano',            'oud-milano',            'KW', 'MENA')
ON CONFLICT (slug) DO UPDATE
  SET country = EXCLUDED.country
  WHERE brands.country IS NULL;

-- ── Oman (OM) ─────────────────────────────────────────────────────────────────
INSERT INTO brands (name, slug, country, region) VALUES
  ('Amouage',               'amouage',               'OM', 'MENA'),
  ('Nabeel Perfumes',       'nabeel-perfumes',       'OM', 'MENA'),
  ('Al Hajar',              'al-hajar',              'OM', 'MENA'),
  ('Salalah Perfumes',      'salalah-perfumes',      'OM', 'MENA')
ON CONFLICT (slug) DO UPDATE
  SET country = EXCLUDED.country
  WHERE brands.country IS NULL;

-- ── Qatar (QA) ────────────────────────────────────────────────────────────────
INSERT INTO brands (name, slug, country, region) VALUES
  ('Hajar Al Ward',         'hajar-al-ward',         'QA', 'MENA'),
  ('Qatari Diar Perfumes',  'qatari-diar-perfumes',  'QA', 'MENA')
ON CONFLICT (slug) DO UPDATE
  SET country = EXCLUDED.country
  WHERE brands.country IS NULL;

-- ── Bahrain (BH) ─────────────────────────────────────────────────────────────
INSERT INTO brands (name, slug, country, region) VALUES
  ('Hind Al Oud',           'hind-al-oud',           'BH', 'MENA'),
  ('Al Dana',               'al-dana',               'BH', 'MENA')
ON CONFLICT (slug) DO UPDATE
  SET country = EXCLUDED.country
  WHERE brands.country IS NULL;

-- ── Pakistan (PK) ────────────────────────────────────────────────────────────
INSERT INTO brands (name, slug, country, region) VALUES
  ('J. Junaid Jamshed',     'j-junaid-jamshed',      'PK', 'Asian'),
  ('Bonanza Satrangi',      'bonanza-satrangi',      'PK', 'Asian'),
  ('Scentsation',           'scentsation',           'PK', 'Asian')
ON CONFLICT (slug) DO UPDATE
  SET country = EXCLUDED.country
  WHERE brands.country IS NULL;

-- ── India (IN) ───────────────────────────────────────────────────────────────
INSERT INTO brands (name, slug, country, region) VALUES
  ('Neesh Perfumes',        'neesh-perfumes',        'IN', 'Asian'),
  ('Gulnaaz',               'gulnaaz',               'IN', 'Asian'),
  ('Pahadi Local',          'pahadi-local',          'IN', 'Asian'),
  ('Kannauj Rose',          'kannauj-rose',          'IN', 'Asian'),
  ('Nish Perfumes',         'nish-perfumes',         'IN', 'Asian')
ON CONFLICT (slug) DO UPDATE
  SET country = EXCLUDED.country
  WHERE brands.country IS NULL;

-- ── Morocco (MA) ─────────────────────────────────────────────────────────────
INSERT INTO brands (name, slug, country, region) VALUES
  ('El Nabil',              'el-nabil',              'MA', 'MENA'),
  ('Musc d Oro',            'musc-d-oro',            'MA', 'MENA')
ON CONFLICT (slug) DO UPDATE
  SET country = EXCLUDED.country
  WHERE brands.country IS NULL;

-- ── Update existing scraped brands missing country (by slug) ─────────────────
UPDATE brands SET country = 'AE' WHERE slug IN (
  'swiss-arabian', 'rasasi', 'ajmal', 'dukhni', 'lattafa',
  'lattafa-perfumes', 'fragrance-world', 'armaf', 'afnan',
  'al-haramain', 'al-haramain-perfumes'
) AND country IS NULL;

UPDATE brands SET country = 'KW' WHERE slug IN (
  'gissah', 'assaf'
) AND country IS NULL;

UPDATE brands SET country = 'OM' WHERE slug IN (
  'amouage', 'nabeel', 'nabeel-perfumes'
) AND country IS NULL;

-- ── Update by name match (catches scraped brands with different slugs) ────────
UPDATE brands SET country = 'AE' WHERE LOWER(name) IN (
  'swiss arabian', 'rasasi', 'ajmal', 'dukhni', 'lattafa',
  'fragrance world', 'armaf', 'afnan', 'kayali', 'yas perfumes',
  'gulf orchid', 'my perfumes', 'al wataniah', 'paris corner', 'zimaya'
) AND country IS NULL;

UPDATE brands SET country = 'SA' WHERE LOWER(name) IN (
  'al haramain', 'surrati', 'deray', 'al rehab', 'al nuaim',
  'aseel', 'naseem', 'anfasic dokhoon'
) AND country IS NULL;

UPDATE brands SET country = 'KW' WHERE LOWER(name) IN (
  'gissah', 'assaf', 'reef', 'reef international', 'bujirami'
) AND country IS NULL;

UPDATE brands SET country = 'OM' WHERE LOWER(name) IN (
  'amouage', 'nabeel'
) AND country IS NULL;

-- ── Verify after running ──────────────────────────────────────────────────────
SELECT country, COUNT(*) AS brand_count
FROM brands
WHERE country IS NOT NULL
GROUP BY country
ORDER BY brand_count DESC;
