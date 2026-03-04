-- patch-010-mena-brands.sql
-- Seed comprehensive MENA fragrance brand catalog with country codes.
-- Uses ON CONFLICT (slug) DO UPDATE so existing brands get country set
-- if it's currently NULL, but won't overwrite an already-correct country.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── UAE (AE) ──────────────────────────────────────────────────────────────────
INSERT INTO brands (name, slug, country, is_active) VALUES
  ('Lattafa Perfumes',      'lattafa-perfumes',      'AE', true),
  ('Fragrance World',       'fragrance-world',       'AE', true),
  ('Gulf Orchid',           'gulf-orchid',           'AE', true),
  ('Yas Perfumes',          'yas-perfumes',          'AE', true),
  ('Kayali',                'kayali',                'AE', true),
  ('Afnan Perfumes',        'afnan-perfumes',        'AE', true),
  ('Maison Alhambra',       'maison-alhambra',       'AE', true),
  ('Al Wataniah',           'al-wataniah',           'AE', true),
  ('My Perfumes',           'my-perfumes',           'AE', true),
  ('Armaf',                 'armaf',                 'AE', true),
  ('Paris Corner',          'paris-corner',          'AE', true),
  ('Zimaya',                'zimaya',                'AE', true),
  ('Manasik',               'manasik',               'AE', true),
  ('Khalis Perfumes',       'khalis-perfumes',       'AE', true),
  ('Milestone Perfumes',    'milestone-perfumes',    'AE', true),
  ('Emper',                 'emper',                 'AE', true),
  ('Ard Al Zaafaran',       'ard-al-zaafaran',       'AE', true),
  ('Arabiyat Mestamem',     'arabiyat-mestamem',     'AE', true),
  ('Flavia Perfumes',       'flavia-perfumes',       'AE', true),
  ('Camion Blanc',          'camion-blanc',          'AE', true),
  ('Al Fares',              'al-fares',              'AE', true),
  ('Otoori',                'otoori',                'AE', true)
ON CONFLICT (slug) DO UPDATE
  SET country = EXCLUDED.country
  WHERE brands.country IS NULL;

-- ── Saudi Arabia (SA) ─────────────────────────────────────────────────────────
INSERT INTO brands (name, slug, country, is_active) VALUES
  ('Abdul Samad Al Qurashi', 'abdul-samad-al-qurashi', 'SA', true),
  ('Deray',                  'deray',                  'SA', true),
  ('Taif Al Emarat',         'taif-al-emarat',         'SA', true),
  ('Surrati',                'surrati',                'SA', true),
  ('Anfasic Dokhoon',        'anfasic-dokhoon',        'SA', true),
  ('Royal Perfumes',         'royal-perfumes',         'SA', true),
  ('Aseel',                  'aseel',                  'SA', true),
  ('Maison Asrar',           'maison-asrar',           'SA', true),
  ('Ahmed Al Maghribi',      'ahmed-al-maghribi',      'SA', true),
  ('Al Jazeera Perfumes',    'al-jazeera-perfumes',    'SA', true),
  ('Naseem',                 'naseem',                 'SA', true),
  ('Mutamayez',              'mutamayez',              'SA', true),
  ('Hamza',                  'hamza',                  'SA', true),
  ('Abeer',                  'abeer',                  'SA', true),
  ('Al Rehab',               'al-rehab',               'SA', true),
  ('Al Nuaim',               'al-nuaim',               'SA', true)
ON CONFLICT (slug) DO UPDATE
  SET country = EXCLUDED.country
  WHERE brands.country IS NULL;

-- ── Kuwait (KW) ───────────────────────────────────────────────────────────────
INSERT INTO brands (name, slug, country, is_active) VALUES
  ('Reef International',    'reef-international',    'KW', true),
  ('Bujirami',              'bujirami',              'KW', true),
  ('J.',                    'j-perfumes',            'KW', true),
  ('Khasab',                'khasab',                'KW', true),
  ('Al Shareef Oudh',       'al-shareef-oudh',       'KW', true),
  ('Oud Milano',            'oud-milano',            'KW', true)
ON CONFLICT (slug) DO UPDATE
  SET country = EXCLUDED.country
  WHERE brands.country IS NULL;

-- ── Oman (OM) ─────────────────────────────────────────────────────────────────
INSERT INTO brands (name, slug, country, is_active) VALUES
  ('Amouage',               'amouage',               'OM', true),
  ('Nabeel Perfumes',       'nabeel-perfumes',       'OM', true),
  ('Al Hajar',              'al-hajar',              'OM', true),
  ('Salalah Perfumes',      'salalah-perfumes',      'OM', true)
ON CONFLICT (slug) DO UPDATE
  SET country = EXCLUDED.country
  WHERE brands.country IS NULL;

-- ── Qatar (QA) ────────────────────────────────────────────────────────────────
INSERT INTO brands (name, slug, country, is_active) VALUES
  ('Hajar Al Ward',         'hajar-al-ward',         'QA', true),
  ('Qatari Diar Perfumes',  'qatari-diar-perfumes',  'QA', true)
ON CONFLICT (slug) DO UPDATE
  SET country = EXCLUDED.country
  WHERE brands.country IS NULL;

-- ── Bahrain (BH) ─────────────────────────────────────────────────────────────
INSERT INTO brands (name, slug, country, is_active) VALUES
  ('Hind Al Oud',           'hind-al-oud',           'BH', true),
  ('Al Dana',               'al-dana',               'BH', true)
ON CONFLICT (slug) DO UPDATE
  SET country = EXCLUDED.country
  WHERE brands.country IS NULL;

-- ── Pakistan (PK) ────────────────────────────────────────────────────────────
INSERT INTO brands (name, slug, country, is_active) VALUES
  ('J. Junaid Jamshed',     'j-junaid-jamshed',      'PK', true),
  ('Bonanza Satrangi',      'bonanza-satrangi',      'PK', true),
  ('Scentsation',           'scentsation',           'PK', true)
ON CONFLICT (slug) DO UPDATE
  SET country = EXCLUDED.country
  WHERE brands.country IS NULL;

-- ── India (IN) ───────────────────────────────────────────────────────────────
INSERT INTO brands (name, slug, country, is_active) VALUES
  ('Neesh Perfumes',        'neesh-perfumes',        'IN', true),
  ('Gulnaaz',               'gulnaaz',               'IN', true),
  ('Pahadi Local',          'pahadi-local',          'IN', true),
  ('Kannauj Rose',          'kannauj-rose',          'IN', true),
  ('Nish Perfumes',         'nish-perfumes',         'IN', true),
  ('Florencia',             'florencia',             'IN', true)
ON CONFLICT (slug) DO UPDATE
  SET country = EXCLUDED.country
  WHERE brands.country IS NULL;

-- ── Morocco (MA) ─────────────────────────────────────────────────────────────
INSERT INTO brands (name, slug, country, is_active) VALUES
  ('El Nabil',              'el-nabil',              'MA', true),
  ('Musc d Oro',            'musc-d-oro',            'MA', true)
ON CONFLICT (slug) DO UPDATE
  SET country = EXCLUDED.country
  WHERE brands.country IS NULL;

-- ── Update existing brands that have country NULL but are identifiable ────────
-- These brands were scraped but may have been inserted without a country code.

UPDATE brands SET country = 'AE' WHERE slug IN (
  'swiss-arabian', 'rasasi', 'ajmal', 'dukhni', 'lattafa',
  'lattafa-perfumes', 'fragrance-world', 'armaf', 'afnan',
  'al-haramain', 'al-haramain-perfumes'
) AND country IS NULL;

UPDATE brands SET country = 'SA' WHERE slug IN (
  'al-haramain', 'al-haramain-perfumes', 'ajmal'
) AND country IS NULL;

UPDATE brands SET country = 'KW' WHERE slug IN (
  'gissah', 'assaf'
) AND country IS NULL;

UPDATE brands SET country = 'OM' WHERE slug IN (
  'amouage', 'nabeel', 'nabeel-perfumes'
) AND country IS NULL;

-- ── Also set country on brands matched by name (case-insensitive) ─────────────
UPDATE brands SET country = 'AE' WHERE LOWER(name) IN (
  'swiss arabian', 'rasasi', 'ajmal', 'dukhni', 'lattafa',
  'fragrance world', 'armaf', 'afnan', 'kayali', 'yas perfumes',
  'gulf orchid', 'my perfumes', 'al wataniah', 'paris corner', 'zimaya'
) AND country IS NULL;

UPDATE brands SET country = 'SA' WHERE LOWER(name) IN (
  'al haramain', 'al-haramain', 'surrati', 'deray', 'al rehab',
  'al nuaim', 'aseel', 'naseem', 'anfasic', 'anfasic dokhoon'
) AND country IS NULL;

UPDATE brands SET country = 'KW' WHERE LOWER(name) IN (
  'gissah', 'assaf', 'reef', 'reef international', 'bujirami'
) AND country IS NULL;

UPDATE brands SET country = 'OM' WHERE LOWER(name) IN (
  'amouage', 'nabeel'
) AND country IS NULL;

-- ── Summary query — run after applying to verify ─────────────────────────────
-- SELECT country, COUNT(*) as brand_count
-- FROM brands
-- WHERE country IS NOT NULL
-- GROUP BY country
-- ORDER BY brand_count DESC;
