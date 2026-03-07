-- patch-013-retailers-seed.sql
-- Add retailer entries for all new scrapers.
-- Columns: name, slug, domain, platform, base_currency, country, priority
-- Uses ON CONFLICT (slug) DO NOTHING — safe to re-run.
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO retailers (name, slug, domain, platform, base_currency, country, priority) VALUES

  -- Omani brands
  ('Amouage',                'amouage',          'www.amouage.com',              'shopify', 'USD', 'OM', 1),

  -- UAE brand direct stores
  ('Maison Alhambra',        'maison-alhambra',  'maisonalhambraperfume.com',           'shopify', 'USD', 'AE', 2),
  ('Armaf Perfumes',         'armaf',            'www.armaf.ae',        'shopify', 'USD', 'AE', 1),
  ('Paris Corner',           'paris-corner',     'www.pariscornerperfumes.com',               'shopify', 'AED', 'AE', 2),
  ('Fragrance World',        'fragrance-world',  'shopfragranceworld.com',            'shopify', 'AED', 'AE', 2),
  ('Ard Al Zaafaran',        'ard-al-zaafaran',  'ardalzaafaranshop.com',    'shopify', 'USD', 'AE', 2),
  ('Gulf Orchid',            'gulf-orchid',      'shop-gulforchid.com',               'shopify', 'AED', 'AE', 2),
  ('Yas Perfumes',           'yas-perfumes',     'yasperfumes.com',              'shopify', 'AED', 'AE', 2),
  ('Nabeel Perfumes',        'nabeel',           'www.nabeel.com',              'shopify', 'AED', 'AE', 2),

  -- Saudi Arabia brand direct stores
  ('Arabian Oud',            'arabian-oud',      'sa.arabianoud.com',           'shopify', 'USD', 'SA', 1),
  ('Abdul Samad Al Qurashi', 'asa-qurashi',      'sa.abdulsamadalqurashi.com',               'shopify', 'USD', 'SA', 1),
  ('Surrati',                'surrati',          'www.surratiperfumes.com',                  'shopify', 'USD', 'SA', 2),
  ('Al Nuaim',               'al-nuaim',         'al-nuaim.com',                  'shopify', 'USD', 'SA', 2),

  -- Egypt
  ('Al Rehab',               'al-rehab',         'www.alrehab.com',          'shopify', 'USD', 'EG', 2),

  -- Morocco
  ('El Nabil',               'el-nabil',         'www.el-nabil.com',          'shopify', 'EUR', 'MA', 2),

  -- Pakistan
  ('J. Junaid Jamshed',      'j-junaid-jamshed', 'www.junaidjamshed.com',                    'shopify', 'PKR', 'PK', 2),
  ('Bonanza Satrangi',       'bonanza-satrangi', 'www.bonanzasatrangi.com',      'shopify', 'PKR', 'PK', 3),

  -- Multi-brand retailers
  ('Arabia Scents',          'arabia-scents',    'arabiascents.com',             'shopify', 'USD', 'US', 1),
  ('Luluat Al Musk',         'luluat-al-musk',   'luluatalmusk.com',             'shopify', 'USD', 'US', 2),
  ('Oud Store',              'oud-store',        'oudstore.com',                 'shopify', 'USD', 'US', 2),
  ('Emirati Scents',         'emirati-scents',   'emaratiscents.com',            'shopify', 'AED', 'AE', 2),

  -- Already used by existing scrapers — add if missing
  ('Kayali Official',        'kayali-official',  'kayaliofficial.com',           'shopify', 'USD', 'AE', 1),
  ('Ibraq USA',              'ibraq-usa',        'usaibrahimalqurashi.com',      'shopify', 'USD', 'SA', 2)

ON CONFLICT (slug) DO NOTHING;

-- ── Verify ────────────────────────────────────────────────────────────────────
SELECT slug, name, base_currency, country, is_active
FROM retailers
ORDER BY country, name;
