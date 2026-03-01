-- patch-002-new-retailers.sql
-- Run in Supabase SQL Editor to add new retailers and brands
-- After running, execute: npm run scrape && npm run match

-- ─────────────────────────────────────────
-- New Retailers
-- ─────────────────────────────────────────
INSERT INTO retailers (name, slug, domain, platform, base_currency, country, priority)
VALUES
  ('Swiss Arabian',    'swiss-arabian', 'swissarabian.com',          'shopify', 'USD', 'AE', 1),
  ('Al Haramain',      'al-haramain',   'us.alharamainperfumes.com', 'shopify', 'USD', 'SA', 1),
  ('Gissah',           'gissah',        'gissahuae.com',             'shopify', 'AED', 'KW', 1),
  ('Assaf',            'assaf',         'assaf.ae',                  'shopify', 'AED', 'AE', 2),
  ('Rasasi',           'rasasi',        'rasasi.com',                'shopify', 'USD', 'AE', 1),
  ('Ajmal',            'ajmal',         'www.ajmalperfume.com',      'shopify', 'USD', 'AE', 1)
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────────────────
-- New Brands
-- ─────────────────────────────────────────
INSERT INTO brands (name, slug, country, region, description)
VALUES
  ('Gissah',       'gissah',       'KW', 'MENA', 'Kuwaiti luxury fragrance house founded in 2019. Known for artistic bottle design and bold, storytelling scents. The name means "tale" in Arabic.'),
  ('Assaf',        'assaf',        'AE', 'MENA', 'Emirati fragrance house inspired by the Najd desert. Created in collaboration with world-class French perfumers.'),
  ('Rasasi',       'rasasi',       'AE', 'MENA', 'Dubai-based fragrance house established in 1979. One of the UAE''s most established perfume brands, covering attars to modern EDPs.'),
  ('Ajmal',        'ajmal',        'AE', 'MENA', 'UAE fragrance house founded in 1951 by Haji Ajmal Ali. One of the oldest and most respected names in Arabian perfumery.'),
  ('Swiss Arabian','swiss-arabian','AE', 'MENA', 'Bridging Arabian tradition with Swiss precision since 1974. Known for blending classic oud and rose with contemporary European accords.')
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────────────────
-- Verify
-- ─────────────────────────────────────────
SELECT name, slug, domain, base_currency FROM retailers ORDER BY name;
SELECT name, slug, country FROM brands ORDER BY name;
