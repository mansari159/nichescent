-- patch-013-retailers-seed.sql
-- Add retailer entries for all new scrapers.
-- Uses ON CONFLICT (slug) DO NOTHING — safe to re-run.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Brand direct stores ───────────────────────────────────────────────────────
INSERT INTO retailers (name, slug, base_url, currency, country, is_active) VALUES

  -- Omani brands
  ('Amouage',               'amouage',               'https://www.amouage.com',         'USD', 'OM', true),

  -- UAE brand direct stores
  ('Maison Alhambra',       'maison-alhambra',        'https://maisonalhambra.com',      'USD', 'AE', true),
  ('Armaf Perfumes',        'armaf',                  'https://www.armafperfumes.com',   'USD', 'AE', true),
  ('Paris Corner',          'paris-corner',           'https://pariscorner.ae',          'AED', 'AE', true),
  ('Fragrance World',       'fragrance-world',        'https://fragranceworld.ae',       'AED', 'AE', true),
  ('Ard Al Zaafaran',       'ard-al-zaafaran',        'https://ardalzaafaranperfumes.com','USD','AE', true),
  ('Gulf Orchid',           'gulf-orchid',            'https://gulforchid.com',          'AED', 'AE', true),
  ('Yas Perfumes',          'yas-perfumes',           'https://yasperfumes.com',         'AED', 'AE', true),
  ('Nabeel Perfumes',       'nabeel',                 'https://nabelonline.com',         'AED', 'AE', true),

  -- Saudi brand direct stores
  ('Arabian Oud',           'arabian-oud',            'https://www.arabianoud.com',      'USD', 'SA', true),
  ('Abdul Samad Al Qurashi','asa-qurashi',            'https://asaqurashi.com',          'USD', 'SA', true),
  ('Surrati',               'surrati',                'https://surrati.com',             'USD', 'SA', true),
  ('Al Nuaim',              'al-nuaim',               'https://alnuaim.com',             'USD', 'SA', true),

  -- Egyptian brand direct stores
  ('Al Rehab',              'al-rehab',               'https://alrehabperfumes.com',     'USD', 'EG', true),

  -- Moroccan brand direct stores
  ('El Nabil',              'el-nabil',               'https://elnabil-parfums.com',     'EUR', 'MA', true),

  -- Pakistani brand direct stores
  ('J. Junaid Jamshed',     'j-junaid-jamshed',       'https://www.j.pk',               'PKR', 'PK', true),
  ('Bonanza Satrangi',      'bonanza-satrangi',       'https://www.bonanzasatrangi.com', 'PKR', 'PK', true),

  -- Multi-brand retailers
  ('Arabia Scents',         'arabia-scents',          'https://arabiascents.com',        'USD', 'US', true),
  ('Luluat Al Musk',        'luluat-al-musk',         'https://luluatalmusk.com',        'USD', 'US', true),
  ('Oud Store',             'oud-store',              'https://oudstore.com',            'USD', 'US', true),
  ('Emirati Scents',        'emirati-scents',         'https://emaratiscents.com',       'AED', 'AE', true),

  -- Retailer already covered by hind-al-oud scraper but needs entry if missing
  ('Kayali Official',       'kayali-official',        'https://kayaliofficial.com',      'USD', 'AE', true),
  ('Ibraq USA',             'ibraq-usa',              'https://usaibrahimalqurashi.com', 'USD', 'SA', true)

ON CONFLICT (slug) DO NOTHING;

-- ── Verify ────────────────────────────────────────────────────────────────────
SELECT slug, name, currency, country, is_active
FROM retailers
ORDER BY country, name;
