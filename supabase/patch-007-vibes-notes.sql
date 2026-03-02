-- ================================================================
-- patch-007: Vibes, Notes, and Product Associations
-- Run this in Supabase SQL editor
-- ================================================================

-- ── 1. VIBES ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vibes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL UNIQUE,
  slug        text NOT NULL UNIQUE,
  description text,
  emoji       text NOT NULL DEFAULT '✨',
  color_hex   text NOT NULL DEFAULT '#B8882A',
  display_order int NOT NULL DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

INSERT INTO vibes (name, slug, description, emoji, color_hex, display_order) VALUES
  ('Fresh & Clean',     'fresh-clean',     'Bright citrus, aquatic, and green notes that feel crisp and invigorating.',    '💧', '#4A90D9', 1),
  ('Warm & Spicy',      'warm-spicy',      'Rich spices like saffron, cardamom, and cinnamon with amber warmth.',           '🔥', '#D4732A', 2),
  ('Floral & Romantic', 'floral-romantic', 'Rose, jasmine, neroli, and orange blossom — delicate and feminine.',           '🌹', '#C96B8A', 3),
  ('Woody & Earthy',    'woody-earthy',    'Oud, sandalwood, cedarwood, vetiver — grounded and masculine.',                '🌿', '#5C7A3E', 4),
  ('Sweet & Gourmand',  'sweet-gourmand',  'Vanilla, tonka, honey, caramel — rich and indulgent.',                        '🍯', '#C4892A', 5),
  ('Smoky & Intense',   'smoky-intense',   'Leather, tobacco, incense, smoke — bold and mysterious.',                     '🖤', '#3D3D3D', 6)
ON CONFLICT (slug) DO NOTHING;

-- ── 2. PRODUCT ↔ VIBE JUNCTION ───────────────────────────────────
CREATE TABLE IF NOT EXISTS product_vibes (
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  vibe_id     uuid NOT NULL REFERENCES vibes(id) ON DELETE CASCADE,
  strength    text NOT NULL DEFAULT 'primary' CHECK (strength IN ('primary', 'secondary')),
  PRIMARY KEY (product_id, vibe_id)
);

CREATE INDEX IF NOT EXISTS idx_product_vibes_product ON product_vibes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_vibes_vibe    ON product_vibes(vibe_id);

-- ── 3. NOTES ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL UNIQUE,
  slug        text NOT NULL UNIQUE,
  category    text NOT NULL CHECK (category IN ('citrus','floral','woody','spicy','sweet','resinous','musk','aquatic','earthy')),
  description text,
  created_at  timestamptz DEFAULT now()
);

INSERT INTO notes (name, slug, category) VALUES
  -- Woody/Resinous (the MENA core)
  ('Oud',           'oud',           'woody'),
  ('Sandalwood',    'sandalwood',    'woody'),
  ('Cedarwood',     'cedarwood',     'woody'),
  ('Vetiver',       'vetiver',       'woody'),
  ('Patchouli',     'patchouli',     'woody'),
  ('Benzoin',       'benzoin',       'resinous'),
  ('Labdanum',      'labdanum',      'resinous'),
  ('Incense',       'incense',       'resinous'),
  ('Amber',         'amber',         'resinous'),
  -- Spicy
  ('Saffron',       'saffron',       'spicy'),
  ('Cardamom',      'cardamom',      'spicy'),
  ('Cinnamon',      'cinnamon',      'spicy'),
  ('Pink Pepper',   'pink-pepper',   'spicy'),
  -- Floral
  ('Rose',          'rose',          'floral'),
  ('Jasmine',       'jasmine',       'floral'),
  ('Orange Blossom','orange-blossom','floral'),
  ('Ylang Ylang',   'ylang-ylang',   'floral'),
  ('Neroli',        'neroli',        'floral'),
  -- Sweet/Gourmand
  ('Vanilla',       'vanilla',       'sweet'),
  ('Tonka Bean',    'tonka-bean',    'sweet'),
  ('Caramel',       'caramel',       'sweet'),
  ('Honey',         'honey',         'sweet'),
  -- Musk/Earthy
  ('Musk',          'musk',          'musk'),
  ('Leather',       'leather',       'earthy'),
  ('Tobacco',       'tobacco',       'earthy'),
  ('Smoke',         'smoke',         'earthy'),
  -- Citrus/Aquatic
  ('Bergamot',      'bergamot',      'citrus'),
  ('Grapefruit',    'grapefruit',    'citrus'),
  ('Lavender',      'lavender',      'floral'),
  ('Aquatic',       'aquatic',       'aquatic')
ON CONFLICT (slug) DO NOTHING;

-- ── 4. PRODUCT ↔ NOTE JUNCTION ───────────────────────────────────
CREATE TABLE IF NOT EXISTS product_notes (
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  note_id     uuid NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  position    text CHECK (position IN ('top', 'mid', 'base', 'general')),
  PRIMARY KEY (product_id, note_id)
);

CREATE INDEX IF NOT EXISTS idx_product_notes_product ON product_notes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_notes_note    ON product_notes(note_id);

-- ── 5. DENORMALIZED VIBE COLUMN ON PRODUCTS ──────────────────────
-- Speeds up product card display without needing a JOIN
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS primary_vibe_slug text,
  ADD COLUMN IF NOT EXISTS primary_vibe_emoji text;

-- ── 6. RPC: get_similar_products ─────────────────────────────────
-- Called from the SimilarFragrances component
CREATE OR REPLACE FUNCTION get_similar_products(
  p_product_id  uuid,
  p_limit       int DEFAULT 6
)
RETURNS TABLE (
  id              uuid,
  name            text,
  slug            text,
  brand_id        uuid,
  fragrance_type  text,
  gender          text,
  image_url       text,
  lowest_price    numeric,
  retailers_count int,
  primary_vibe_slug text,
  primary_vibe_emoji text,
  score           int
) LANGUAGE sql STABLE AS $$
  WITH target AS (
    SELECT
      p.id,
      p.brand_id,
      p.lowest_price,
      p.primary_vibe_slug,
      pv2.vibe_id AS secondary_vibe_id
    FROM products p
    LEFT JOIN product_vibes pv2 ON pv2.product_id = p.id AND pv2.strength = 'secondary'
    WHERE p.id = p_product_id
    LIMIT 1
  ),
  target_notes AS (
    SELECT note_id FROM product_notes WHERE product_id = p_product_id
  ),
  target_vibe AS (
    SELECT vibe_id FROM product_vibes WHERE product_id = p_product_id AND strength = 'primary'
  ),
  scored AS (
    SELECT
      p.id,
      p.name,
      p.slug,
      p.brand_id,
      p.fragrance_type,
      p.gender,
      p.image_url,
      p.lowest_price,
      p.retailers_count,
      p.primary_vibe_slug,
      p.primary_vibe_emoji,
      (
        -- Same primary vibe: +50
        COALESCE((
          SELECT 50 FROM product_vibes pv
          JOIN target_vibe tv ON tv.vibe_id = pv.vibe_id
          WHERE pv.product_id = p.id AND pv.strength = 'primary'
          LIMIT 1
        ), 0)
        -- Shared notes: +10 each
        + COALESCE((
          SELECT COUNT(*)::int * 10
          FROM product_notes pn
          JOIN target_notes tn ON tn.note_id = pn.note_id
          WHERE pn.product_id = p.id
        ), 0)
        -- Same brand: -20 (prefer diversity)
        - CASE WHEN p.brand_id = (SELECT brand_id FROM target) THEN 20 ELSE 0 END
        -- Similar price (±30%): +15
        + CASE
            WHEN (SELECT lowest_price FROM target) IS NOT NULL
              AND p.lowest_price IS NOT NULL
              AND p.lowest_price BETWEEN (SELECT lowest_price FROM target) * 0.7
                                     AND (SELECT lowest_price FROM target) * 1.3
            THEN 15 ELSE 0
          END
      ) AS score
    FROM products p
    WHERE p.id <> p_product_id
      AND p.is_active = true
      AND p.lowest_price IS NOT NULL
  )
  SELECT * FROM scored
  WHERE score > 0
  ORDER BY score DESC, retailers_count DESC
  LIMIT p_limit;
$$;

-- ── 7. PERFORMANCE INDEXES ───────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_primary_vibe ON products(primary_vibe_slug);
CREATE INDEX IF NOT EXISTS idx_notes_category        ON notes(category);
CREATE INDEX IF NOT EXISTS idx_vibes_slug            ON vibes(slug);
