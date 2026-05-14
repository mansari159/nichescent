'use strict';
/**
 * RareTrace — DB Migration (Phase 2)
 * Creates: houses, fragrances, promotions tables + compute_rank_score function.
 * Safe to re-run (IF NOT EXISTS throughout).
 *
 * Run: node scripts/db-migrate.js
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('HALT: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing from .env.local');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_KEY);

// ── Full schema SQL ───────────────────────────────────────────────────────────
const FULL_SCHEMA_SQL = `
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
  search_vector     tsvector
                    GENERATED ALWAYS AS (
                      setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
                      setweight(to_tsvector('english', COALESCE(house_name, '')), 'B') ||
                      setweight(to_tsvector('english', COALESCE(array_to_string(top_notes, ' '), '')), 'B') ||
                      setweight(to_tsvector('english', COALESCE(array_to_string(heart_notes, ' '), '')), 'B') ||
                      setweight(to_tsvector('english', COALESCE(array_to_string(base_notes, ' '), '')), 'B') ||
                      setweight(to_tsvector('english', COALESCE(array_to_string(main_accords, ' '), '')), 'C') ||
                      setweight(to_tsvector('english', COALESCE(array_to_string(mood_tags, ' '), '')), 'C') ||
                      setweight(to_tsvector('english', COALESCE(plain_description, '')), 'D')
                    ) STORED,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

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
`;

// ── Migration runner ──────────────────────────────────────────────────────────
const MIGRATIONS = [
  { name: 'full-schema', sql: FULL_SCHEMA_SQL },
];

async function runMigration(m) {
  console.log(`  Running: ${m.name}…`);
  const { error } = await sb.rpc('exec_sql', { query: m.sql });
  if (error) {
    if (error.message && error.message.includes('exec_sql')) {
      return 'no-exec-sql';
    }
    console.error(`  ✗ SQL error in "${m.name}": ${error.message}`);
    process.exit(1);
  }
  console.log(`  ✓ ${m.name}`);
  return 'ok';
}

async function writeSchemaFile() {
  const dir = path.join(__dirname, '..', 'supabase', 'rebuild');
  fs.mkdirSync(dir, { recursive: true });
  const outPath = path.join(dir, '000-full-schema.sql');
  fs.writeFileSync(outPath, MIGRATIONS.map(m => `-- ${m.name}\n${m.sql}`).join('\n\n'));
  console.log(`\n  SQL written to: supabase/rebuild/000-full-schema.sql`);
  console.log(`\n  ┌─────────────────────────────────────────────────────────────┐`);
  console.log(`  │  MANUAL STEP REQUIRED                                       │`);
  console.log(`  │                                                             │`);
  console.log(`  │  1. Open https://supabase.com/dashboard/project/            │`);
  console.log(`  │     uhrhmklhgodpogmajais/sql/new                            │`);
  console.log(`  │  2. Paste contents of supabase/rebuild/000-full-schema.sql  │`);
  console.log(`  │  3. Click Run                                               │`);
  console.log(`  │  4. Re-run: node scripts/db-migrate.js                      │`);
  console.log(`  │                                                             │`);
  console.log(`  │  To enable fully automated migration, also run once:        │`);
  console.log(`  │  CREATE OR REPLACE FUNCTION exec_sql(query text)            │`);
  console.log(`  │    RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS        │`);
  console.log(`  │    $$ BEGIN EXECUTE query; END; $$;                         │`);
  console.log(`  │  GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;  │`);
  console.log(`  └─────────────────────────────────────────────────────────────┘\n`);
}

async function verifyTables() {
  const tables = ['houses', 'fragrances', 'promotions'];
  let allOk = true;
  for (const t of tables) {
    const { count, error } = await sb.from(t).select('*', { count: 'exact', head: true });
    if (error) {
      console.error(`  ✗ Table "${t}" missing or inaccessible: ${error.message}`);
      allOk = false;
    } else {
      console.log(`  ✓ ${t}: ${count} rows`);
    }
  }
  return allOk;
}

async function main() {
  console.log('\n═══════════════════════════════════════');
  console.log('  RareTrace — Phase 2: DB Migration');
  console.log('═══════════════════════════════════════\n');

  let needsManual = false;
  for (const m of MIGRATIONS) {
    const result = await runMigration(m);
    if (result === 'no-exec-sql') {
      needsManual = true;
      break;
    }
  }

  if (needsManual) {
    await writeSchemaFile();
    process.exit(0);
  }

  console.log('\n  Verifying tables…');
  const ok = await verifyTables();

  if (!ok) {
    console.error('\nHALT: One or more tables missing after migration. Check SQL errors above.');
    process.exit(1);
  }

  console.log('\n✓ Phase 2 complete — schema ready.\n');
}

main().catch(err => { console.error(err); process.exit(1); });
