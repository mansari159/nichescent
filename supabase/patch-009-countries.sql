-- =============================================================
-- patch-009: countries table + seed 50 countries
-- Run in Supabase SQL editor
-- =============================================================

-- 1. Create countries table
CREATE TABLE IF NOT EXISTS countries (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  code             CHAR(2) NOT NULL UNIQUE,
  flag_emoji       TEXT NOT NULL,
  region           TEXT NOT NULL,  -- 'Middle East', 'South Asia', 'Southeast Asia', 'East Asia', 'Europe', 'Americas', 'Oceania', 'Africa'
  hero_image_url   TEXT,           -- cityscape for country page header
  heritage_description TEXT,       -- perfumery history
  perfumery_tradition  TEXT,       -- key note families / traditions
  display_order    INTEGER DEFAULT 99,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add country_id FK to brands (keeps existing country TEXT for backward compat)
ALTER TABLE brands ADD COLUMN IF NOT EXISTS country_id UUID REFERENCES countries(id);

-- 3. Seed 50 countries
INSERT INTO countries (name, code, flag_emoji, region, display_order) VALUES
-- ── Middle East (core region) ────────────────────────
('Saudi Arabia',          'SA', '🇸🇦', 'Middle East',   1),
('United Arab Emirates',  'AE', '🇦🇪', 'Middle East',   2),
('Kuwait',                'KW', '🇰🇼', 'Middle East',   3),
('Oman',                  'OM', '🇴🇲', 'Middle East',   4),
('Qatar',                 'QA', '🇶🇦', 'Middle East',   5),
('Bahrain',               'BH', '🇧🇭', 'Middle East',   6),
('Egypt',                 'EG', '🇪🇬', 'Middle East',   7),
('Morocco',               'MA', '🇲🇦', 'Middle East',   8),
('Jordan',                'JO', '🇯🇴', 'Middle East',   9),
('Lebanon',               'LB', '🇱🇧', 'Middle East',  10),
('Palestine',             'PS', '🇵🇸', 'Middle East',  11),
('Iraq',                  'IQ', '🇮🇶', 'Middle East',  12),
('Iran',                  'IR', '🇮🇷', 'Middle East',  13),
('Turkey',                'TR', '🇹🇷', 'Middle East',  14),
('Algeria',               'DZ', '🇩🇿', 'Middle East',  15),
('Tunisia',               'TN', '🇹🇳', 'Middle East',  16),
-- ── South Asia ──────────────────────────────────────
('India',                 'IN', '🇮🇳', 'South Asia',   20),
('Pakistan',              'PK', '🇵🇰', 'South Asia',   21),
('Bangladesh',            'BD', '🇧🇩', 'South Asia',   22),
('Sri Lanka',             'LK', '🇱🇰', 'South Asia',   23),
-- ── Southeast Asia ──────────────────────────────────
('Indonesia',             'ID', '🇮🇩', 'Southeast Asia', 30),
('Malaysia',              'MY', '🇲🇾', 'Southeast Asia', 31),
('Thailand',              'TH', '🇹🇭', 'Southeast Asia', 32),
('Singapore',             'SG', '🇸🇬', 'Southeast Asia', 33),
('Philippines',           'PH', '🇵🇭', 'Southeast Asia', 34),
('Vietnam',               'VN', '🇻🇳', 'Southeast Asia', 35),
-- ── East Asia ───────────────────────────────────────
('Japan',                 'JP', '🇯🇵', 'East Asia',    40),
('South Korea',           'KR', '🇰🇷', 'East Asia',    41),
('China',                 'CN', '🇨🇳', 'East Asia',    42),
-- ── Europe ──────────────────────────────────────────
('France',                'FR', '🇫🇷', 'Europe',       50),
('Italy',                 'IT', '🇮🇹', 'Europe',       51),
('United Kingdom',        'GB', '🇬🇧', 'Europe',       52),
('Germany',               'DE', '🇩🇪', 'Europe',       53),
('Spain',                 'ES', '🇪🇸', 'Europe',       54),
('Switzerland',           'CH', '🇨🇭', 'Europe',       55),
('Netherlands',           'NL', '🇳🇱', 'Europe',       56),
('Sweden',                'SE', '🇸🇪', 'Europe',       57),
('Denmark',               'DK', '🇩🇰', 'Europe',       58),
('Belgium',               'BE', '🇧🇪', 'Europe',       59),
('Poland',                'PL', '🇵🇱', 'Europe',       60),
('Portugal',              'PT', '🇵🇹', 'Europe',       61),
('Austria',               'AT', '🇦🇹', 'Europe',       62),
-- ── Americas ────────────────────────────────────────
('United States',         'US', '🇺🇸', 'Americas',     70),
('Canada',                'CA', '🇨🇦', 'Americas',     71),
('Brazil',                'BR', '🇧🇷', 'Americas',     72),
('Mexico',                'MX', '🇲🇽', 'Americas',     73),
-- ── Oceania ─────────────────────────────────────────
('Australia',             'AU', '🇦🇺', 'Oceania',      80),
('New Zealand',           'NZ', '🇳🇿', 'Oceania',      81),
-- ── Africa ──────────────────────────────────────────
('South Africa',          'ZA', '🇿🇦', 'Africa',       90),
('Nigeria',               'NG', '🇳🇬', 'Africa',       91),
('Kenya',                 'KE', '🇰🇪', 'Africa',       92)
ON CONFLICT (code) DO NOTHING;

-- 4. Heritage descriptions for key perfumery countries
UPDATE countries SET
  heritage_description = 'Saudi Arabia is the heartland of Arabian perfumery, home to centuries of oud and rose traditions. The kingdom''s desert climate inspired rich, enveloping scents built around oud al-Cambodi and Taif rose — the finest rose in the world.',
  perfumery_tradition  = 'Oud, Taif rose, musk, bakhoor, amber',
  hero_image_url       = 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?auto=format&fit=crop&w=1920&q=80'
WHERE code = 'SA';

UPDATE countries SET
  heritage_description = 'The UAE has become the global capital of modern Arabian fragrance, where ancient oud traditions meet contemporary luxury. Dubai hosts hundreds of fragrance houses, from heritage brands to cutting-edge indie labels reimagining Eastern perfumery.',
  perfumery_tradition  = 'Oud, amber, musk, contemporary blends, attars',
  hero_image_url       = 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1920&q=80'
WHERE code = 'AE';

UPDATE countries SET
  heritage_description = 'Kuwait has a rich tradition of layering fragrances — wearing multiple scents simultaneously to create a personal olfactory signature. Kuwaiti perfumery is known for its bold concentrations and distinctive oudh mukhallat blends.',
  perfumery_tradition  = 'Oudh, mukhallat, layering culture, bakhoor',
  hero_image_url       = 'https://images.unsplash.com/photo-1534854638093-bada1813ca19?auto=format&fit=crop&w=1920&q=80'
WHERE code = 'KW';

UPDATE countries SET
  heritage_description = 'Oman is the ancestral home of frankincense, the ancient resin traded across millennia. The Dhofar region produces the world''s finest frankincense, and Amouage — one of the most prestigious perfume houses on Earth — was founded here by royal decree in 1983.',
  perfumery_tradition  = 'Frankincense, oud, rose, silver frankincense, luban',
  hero_image_url       = 'https://images.unsplash.com/photo-1586699253884-e199770f63b9?auto=format&fit=crop&w=1920&q=80'
WHERE code = 'OM';

UPDATE countries SET
  heritage_description = 'India has a 4,000-year history of perfumery, from ancient attar distillation in Kannauj — the "Grasse of the East" — to Mughal court rose and oud blends. Indian oud from Assam is among the most prized agarwood in the world.',
  perfumery_tradition  = 'Attar, oud, sandalwood, rose, jasmine, henna',
  hero_image_url       = 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1920&q=80'
WHERE code = 'IN';

UPDATE countries SET
  heritage_description = 'France is synonymous with haute parfumerie, home to Grasse — the perfume capital of the world. French perfumery elevated fragrance to an art form, pioneering synthetic ingredients and the concept of artistic perfumery across four centuries.',
  perfumery_tradition  = 'Floral, chypre, fougère, avant-garde, luxury concentrates',
  hero_image_url       = 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1920&q=80'
WHERE code = 'FR';

UPDATE countries SET
  heritage_description = 'Indonesia is the world''s largest producer of Agarwood (oud), producing rich, earthy, and complex oud oils from Kalimantan and Sumatra. Indonesian oud has a distinctive barnyard, earthy character deeply beloved by connoisseurs and collectors.',
  perfumery_tradition  = 'Oud/agarwood production, tropical florals, patchouli',
  hero_image_url       = 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1920&q=80'
WHERE code = 'ID';

UPDATE countries SET
  heritage_description = 'Italy is home to some of the world''s most exclusive niche perfumers. From Roman houses to Milanese luxury brands, Italian perfumery combines ancient botanical knowledge with contemporary artistic vision and opulent materials.',
  perfumery_tradition  = 'Niche luxury, citruses, Mediterranean herbs, iris, leather',
  hero_image_url       = 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1920&q=80'
WHERE code = 'IT';

UPDATE countries SET
  heritage_description = 'The United Kingdom has a long tradition of artisan perfumery, from Victorian-era apothecaries to today''s thriving indie fragrance scene. British perfumery is known for its eccentricity, literary references, and bold experimental approach.',
  perfumery_tradition  = 'Artisan, floral, green, literary-inspired, chypre',
  hero_image_url       = 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1920&q=80'
WHERE code = 'GB';

UPDATE countries SET
  heritage_description = 'The United States has developed a vibrant indie fragrance scene, particularly in New York and the Pacific Northwest. American perfumers are known for their avant-garde approach, unconventional materials, and narrative-driven compositions.',
  perfumery_tradition  = 'Indie, artisan, avant-garde, narrative-driven',
  hero_image_url       = 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=1920&q=80'
WHERE code = 'US';

UPDATE countries SET
  heritage_description = 'Australia has emerged as a fresh voice in global perfumery, drawing from its unique flora — eucalyptus, wattle, desert botanicals — to create fragrances unlike anywhere else on earth. Australian indie houses are gaining worldwide recognition.',
  perfumery_tradition  = 'Native botanicals, eucalyptus, wattle, coastal accords',
  hero_image_url       = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1920&q=80'
WHERE code = 'AU';

UPDATE countries SET
  heritage_description = 'Japan brings its philosophy of wabi-sabi and minimalism to fragrance, creating restrained, meditative scents that prioritize silence and negative space. Japanese perfumery often incorporates traditional incense (kodo) traditions.',
  perfumery_tradition  = 'Minimalist, incense (kodo), hinoki, green tea, understated',
  hero_image_url       = 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=1920&q=80'
WHERE code = 'JP';

UPDATE countries SET
  heritage_description = 'Morocco is a crossroads of Berber, Arab, and Mediterranean perfumery traditions. The country is renowned for its rose harvest in the Valley of Roses (Kelaat M''gouna), and for complex ouds and attars blending African and Middle Eastern styles.',
  perfumery_tradition  = 'Rose, oud, amber, argan, traditional attars',
  hero_image_url       = 'https://images.unsplash.com/photo-1539020140153-e5d9f3d2c5d5?auto=format&fit=crop&w=1920&q=80'
WHERE code = 'MA';

-- 5. Link existing brands to countries via country_id
UPDATE brands
SET country_id = (SELECT id FROM countries WHERE code = brands.country)
WHERE brands.country IS NOT NULL
  AND EXISTS (SELECT 1 FROM countries WHERE code = brands.country);

-- 6. Performance indexes
CREATE INDEX IF NOT EXISTS idx_brands_country_id   ON brands(country_id);
CREATE INDEX IF NOT EXISTS idx_countries_code      ON countries(code);
CREATE INDEX IF NOT EXISTS idx_countries_region    ON countries(region);
CREATE INDEX IF NOT EXISTS idx_countries_display   ON countries(display_order);
