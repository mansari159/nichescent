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

-- ── patch-013b: additional brands from verified URL list ──────────────────────
INSERT INTO retailers (name, slug, domain, platform, base_currency, country, priority) VALUES

  -- UAE — Heritage / Niche
  ('Arabiyat Prestige',    'arabiyat-prestige',  'thearabiyat.com',               'shopify', 'AED', 'AE', 2),
  ('Naseem',               'naseem',             'naseemperfumes.us',             'shopify', 'USD', 'AE', 2),
  ('Ghawali',              'ghawali',            'ae.ghawali.com',                'shopify', 'AED', 'AE', 2),
  ('The Spirit of Dubai',  'spirit-of-dubai',    'thespiritofdubai.com',          'shopify', 'USD', 'AE', 1),
  ('WIDIAN',               'widian',             'ajarabia.com',                  'shopify', 'USD', 'AE', 1),
  ('Khalis Perfumes',      'khalis-perfumes',    'www.khalisperfumes.com',        'shopify', 'USD', 'AE', 2),
  ('Sapil',                'sapil',              'sapil.com',                     'shopify', 'USD', 'AE', 3),
  ('Reef Perfumes',        'reef-perfumes',      'reefperfumes.com',              'shopify', 'USD', 'AE', 2),
  ('Hamidi',               'hamidi',             'www.hamidi.us',                 'shopify', 'USD', 'AE', 2),
  ('Orientica',            'orientica',          'www.orienticaperfumes.com',     'shopify', 'USD', 'AE', 2),
  ('Maison Asrar',         'maison-asrar',       'maisonasrar.com',               'shopify', 'USD', 'AE', 2),
  ('Emirates Pride',       'emirates-pride',     'emiratespride.ae',              'shopify', 'AED', 'AE', 3),
  ('Attar Collection',     'attar-collection',   'attarcollection.com',           'shopify', 'USD', 'AE', 1),
  ('Navitus Parfums',      'navitus',            'navitusparfums.com',            'shopify', 'USD', 'AE', 2),

  -- UAE — Accessible / Dupe
  ('Zimaya',               'zimaya',             'zimayaperfumes.com',            'shopify', 'USD', 'AE', 2),
  ('Khadlaj',              'khadlaj',            'www.khadlaj-perfumes.com',      'shopify', 'AED', 'AE', 2),
  ('Riiffs',               'riiffs',             'www.riiffsperfumes.com',        'shopify', 'USD', 'AE', 2),
  ('Rue Broca',            'rue-broca',          'www.ruebrocaparfums.com',       'shopify', 'USD', 'AE', 2),
  ('Rayhaan',              'rayhaan',            'rayhaanperfumes.com',           'shopify', 'USD', 'AE', 2),
  ('Emper',                'emper',              'www.emperperfumes.com',         'shopify', 'USD', 'AE', 3),
  ('French Avenue',        'french-avenue',      'www.french-avenue-parfum.com',  'shopify', 'EUR', 'AE', 3),
  ('Louis Cardin',         'louis-cardin',       'louiscardin.co.uk',             'shopify', 'GBP', 'AE', 3),
  ('Dumont',               'dumont',             'dumontperfumes.com',            'shopify', 'USD', 'AE', 3),
  ('My Perfumes',          'my-perfumes',        'myperfumes.ae',                 'shopify', 'AED', 'AE', 2),
  ('Kajal Perfumes',       'kajal-perfumes',     'kajalperfumes.com',             'shopify', 'USD', 'AE', 1),
  ('Azha Perfumes',        'azha-perfumes',      'azhaperfumes.com',              'shopify', 'AED', 'AE', 2),
  ('Al Wataniah',          'al-wataniah',        'www.alwataniah.com',            'shopify', 'AED', 'AE', 2),
  ('Suroori',              'suroori',            'suroorfragrances.com',          'shopify', 'USD', 'AE', 3),

  -- Saudi Arabia
  ('Ahmad Al Maghribi',    'ahmad-al-maghribi',  'www.ahmed-perfume.com',         'shopify', 'USD', 'SA', 2),

  -- Pakistan
  ('Scents N Stories',     'scents-n-stories',   'scentsnstories.pk',             'shopify', 'PKR', 'PK', 2),
  ('Saeed Ghani',          'saeed-ghani',        'saeedghani.pk',                 'shopify', 'PKR', 'PK', 2),
  ('WB by Hemani',         'wb-hemani',          'www.wbhemani.com',              'shopify', 'PKR', 'PK', 2),
  ('Colish Perfumes',      'colish',             'www.colishco.com',              'shopify', 'PKR', 'PK', 3),

  -- Indonesia
  ('Velixir',              'velixir',            'www.velixirparfums.com',        'shopify', 'USD', 'ID', 2)

ON CONFLICT (slug) DO NOTHING;
