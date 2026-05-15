-- full-schema

-- RareTrace schema rebuild
-- Safe to run multiple times (IF NOT EXISTS throughout)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ── houses ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS houses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  origin_country  TEXT,
  origin_city     TEXT,
  founded_year    INTEGER,
  house_type      TEXT NOT NULL DEFAULT 'niche'
                  CHECK (house_type IN ('niche','indie','middle_eastern','designer')),
  story           TEXT,
  signature_dna   TEXT,
  video_city      TEXT,
  logo_path       TEXT,
  website_url     TEXT,
  products_count  INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_houses_slug ON houses(slug);
CREATE INDEX IF NOT EXISTS idx_houses_type ON houses(house_type);
CREATE INDEX IF NOT EXISTS idx_houses_country ON houses(origin_country);

-- ── fragrances ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fragrances (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  house_id          UUID REFERENCES houses(id),
  house_name        TEXT,
  year              INTEGER,
  gender            TEXT DEFAULT 'unisex'
                    CHECK (gender IN ('masculine','feminine','unisex')),
  top_notes         TEXT[] DEFAULT '{}',
  heart_notes       TEXT[] DEFAULT '{}',
  base_notes        TEXT[] DEFAULT '{}',
  main_accords      TEXT[] DEFAULT '{}',
  house_type        TEXT NOT NULL DEFAULT 'niche'
                    CHECK (house_type IN ('niche','indie','middle_eastern','designer','clone')),
  tier              TEXT DEFAULT 'mid'
                    CHECK (tier IN ('budget','mid','niche_tier','luxury')),
  clone_of          UUID REFERENCES fragrances(id),
  similarity_score  DECIMAL(4,2),
  longevity_rating  DECIMAL(4,2) DEFAULT 0,
  sillage_rating    DECIMAL(4,2) DEFAULT 0,
  community_rating  DECIMAL(4,2) DEFAULT 0,
  plain_description TEXT,
  mood_tags         TEXT[] DEFAULT '{}',
  occasion_tags     TEXT[] DEFAULT '{}',
  season_tags       TEXT[] DEFAULT '{}',
  editorial_score   DECIMAL(4,2) DEFAULT 0,
  rank_score        DECIMAL(10,2) DEFAULT 0,
  affiliate_links   JSONB DEFAULT '{}',
  image_path        TEXT,
  image_url         TEXT,
  is_active         BOOLEAN DEFAULT true,
  search_vector     tsvector,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── search_vector trigger (GENERATED ALWAYS AS can't use array_to_string) ─────
CREATE OR REPLACE FUNCTION fragrances_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.house_name, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.top_notes, ' '), '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.heart_notes, ' '), '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.base_notes, ' '), '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.main_accords, ' '), '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.mood_tags, ' '), '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.plain_description, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_fragrances_search_vector ON fragrances;
CREATE TRIGGER trg_fragrances_search_vector
  BEFORE INSERT OR UPDATE ON fragrances
  FOR EACH ROW EXECUTE FUNCTION fragrances_search_vector_update();

CREATE INDEX IF NOT EXISTS idx_fragrances_slug        ON fragrances(slug);
CREATE INDEX IF NOT EXISTS idx_fragrances_house_id    ON fragrances(house_id);
CREATE INDEX IF NOT EXISTS idx_fragrances_house_type  ON fragrances(house_type);
CREATE INDEX IF NOT EXISTS idx_fragrances_gender      ON fragrances(gender);
CREATE INDEX IF NOT EXISTS idx_fragrances_tier        ON fragrances(tier);
CREATE INDEX IF NOT EXISTS idx_fragrances_rank        ON fragrances(rank_score DESC);
CREATE INDEX IF NOT EXISTS idx_fragrances_clone_of    ON fragrances(clone_of) WHERE clone_of IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_fragrances_active      ON fragrances(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_fragrances_search      ON fragrances USING GIN(search_vector);

-- ── rank score helper ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION compute_rank_score(
  p_house_type      TEXT,
  p_community       DECIMAL,
  p_editorial       DECIMAL,
  p_longevity       DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
  base DECIMAL;
BEGIN
  base := CASE p_house_type
    WHEN 'middle_eastern' THEN 30
    WHEN 'indie'          THEN 28
    WHEN 'niche'          THEN 25
    WHEN 'clone'          THEN 15
    WHEN 'designer'       THEN -20
    ELSE 0
  END;
  RETURN base
    + COALESCE(p_community, 0) * 8
    + COALESCE(p_editorial, 0) * 5
    + COALESCE(p_longevity, 0) * 3;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ── promotions ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS promotions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fragrance_id    UUID REFERENCES fragrances(id) ON DELETE CASCADE,
  house_name      TEXT,
  image_path      TEXT,
  target_url      TEXT,
  campaign_start  DATE,
  campaign_end    DATE,
  weekly_fee_usd  DECIMAL(10,2),
  impressions     INTEGER DEFAULT 0,
  clicks          INTEGER DEFAULT 0,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(is_active, campaign_end)
  WHERE is_active = true;
