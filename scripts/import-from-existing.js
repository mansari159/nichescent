'use strict';
/**
 * RareTrace — Import from existing Supabase data (Phase 3, Strategy B)
 * Reads brands + products tables → reshapes into houses + fragrances.
 *
 * Run: node scripts/import-from-existing.js
 * Guard: only self-executes when run directly (not when required by import-kaggle.js).
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 255);
}

function inferHouseType(brand) {
  const name = (brand.name || '').toLowerCase();
  const country = (brand.country || brand.region || '').toLowerCase();
  const meCountries = ['ae','sa','kw','qa','bh','om','eg','jo','lb','iq','ir','pk'];
  const meKeywords = ['arabic','arabian','oud','khaleeji','mena','gulf','middle east'];
  const isME = meCountries.some(c => country.includes(c)) ||
               meKeywords.some(k => name.includes(k) || country.includes(k));
  if (isME) return 'middle_eastern';

  const nicheKeywords = ['niche','artisan','indie','boutique','atelier','maison'];
  if (nicheKeywords.some(k => name.includes(k))) return 'indie';

  const bigDesigners = ['chanel','dior','gucci','prada','versace','armani','hugo boss',
    'calvin klein','ralph lauren','yves saint','dolce','givenchy','lancôme','burberry'];
  if (bigDesigners.some(k => name.includes(k))) return 'designer';

  return 'niche';
}

function computeRankScore(houseType, community, editorial, longevity) {
  const base = { middle_eastern: 30, indie: 28, niche: 25, clone: 15, designer: -20 }[houseType] ?? 0;
  return base + (community ?? 0) * 8 + (editorial ?? 0) * 5 + (longevity ?? 0) * 3;
}

function inferGender(g) {
  if (!g) return 'unisex';
  const lower = g.toLowerCase();
  if (lower === 'men' || lower === 'masculine') return 'masculine';
  if (lower === 'women' || lower === 'feminine') return 'feminine';
  return 'unisex';
}

function inferTier(price) {
  if (!price) return 'mid';
  if (price < 30)  return 'budget';
  if (price < 100) return 'mid';
  if (price < 300) return 'niche_tier';
  return 'luxury';
}

async function importFromExisting() {
  console.log('\n── Strategy B: importing from existing brands/products ──\n');

  // ── 1. Load brands ────────────────────────────────────────────────────────
  console.log('Loading brands…');
  const { data: brands, error: bErr } = await sb
    .from('brands')
    .select('*')
    .order('name');
  if (bErr) { console.error('brands error:', bErr.message); process.exit(1); }
  console.log(`  ${brands.length} brands loaded.`);

  // ── 2. Build houses payload ───────────────────────────────────────────────
  const housesPayload = brands.map(b => ({
    name:           b.name,
    slug:           b.slug,
    origin_country: b.country ?? null,
    origin_city:    null,
    founded_year:   b.founded_year ?? null,
    house_type:     inferHouseType(b),
    story:          b.description ?? null,
    signature_dna:  b.signature_style ?? null,
    video_city:     null,
    logo_path:      b.logo_url ?? null,
    website_url:    b.website_url ?? null,
    products_count: b.products_count ?? 0,
  }));

  console.log(`Upserting ${housesPayload.length} houses…`);
  const { error: hErr } = await sb
    .from('houses')
    .upsert(housesPayload, { onConflict: 'slug', ignoreDuplicates: true });
  if (hErr) { console.error('houses upsert error:', hErr.message); process.exit(1); }
  console.log(`✓ Houses upserted.`);

  // ── 3. Build a slug → id map for houses ───────────────────────────────────
  const { data: houseRows } = await sb.from('houses').select('id, slug');
  const houseBySlug = {};
  for (const h of houseRows ?? []) houseBySlug[h.slug] = h.id;

  // ── 4. Load products in batches ───────────────────────────────────────────
  console.log('Loading products…');
  const PAGE = 500;
  let offset = 0;
  let totalImported = 0;
  let allProducts = [];

  while (true) {
    const { data, error } = await sb
      .from('products')
      .select('*, brand:brands(name, slug, country, region)')
      .range(offset, offset + PAGE - 1);
    if (error) { console.error('products error:', error.message); process.exit(1); }
    if (!data || data.length === 0) break;
    allProducts = allProducts.concat(data);
    offset += PAGE;
    if (data.length < PAGE) break;
  }
  console.log(`  ${allProducts.length} products loaded.`);

  // ── 5. Build fragrances payload ───────────────────────────────────────────
  const fragPayload = allProducts.map(p => {
    const brandSlug = p.brand?.slug ?? slugify(p.brand?.name ?? 'unknown');
    const houseId   = houseBySlug[brandSlug] ?? null;
    const houseType = inferHouseType(p.brand ?? {});
    const gender    = inferGender(p.gender);
    const tier      = inferTier(p.lowest_price);
    const community = p.community_rating ?? 0;
    const editorial = p.editorial_score  ?? 0;
    const longevity = p.longevity_rating ?? 0;
    const rankScore = computeRankScore(houseType, community, editorial, longevity);

    return {
      name:             p.name,
      slug:             p.slug,
      house_id:         houseId,
      house_name:       p.brand?.name ?? null,
      year:             p.year ?? null,
      gender,
      top_notes:        p.notes_top    ?? p.top_notes    ?? [],
      heart_notes:      p.notes_mid    ?? p.heart_notes  ?? [],
      base_notes:       p.notes_base   ?? p.base_notes   ?? [],
      main_accords:     p.main_accords ?? p.category_tags ?? [],
      house_type:       houseType,
      tier,
      longevity_rating: longevity,
      sillage_rating:   p.sillage_rating ?? 0,
      community_rating: community,
      editorial_score:  editorial,
      rank_score:       rankScore,
      affiliate_links:  {},
      image_url:        p.image_url ?? null,
      is_active:        p.is_active ?? true,
    };
  });

  // ── 6. Upsert fragrances in batches ───────────────────────────────────────
  const BATCH = 100;
  let inserted = 0;
  for (let i = 0; i < fragPayload.length; i += BATCH) {
    const batch = fragPayload.slice(i, i + BATCH);
    const { error } = await sb
      .from('fragrances')
      .upsert(batch, { onConflict: 'slug', ignoreDuplicates: true });
    if (error) console.warn(`  Batch ${i} error:`, error.message);
    else inserted += batch.length;
    process.stdout.write(`\r  Importing: ${inserted}/${fragPayload.length}`);
  }

  const { count: hC } = await sb.from('houses').select('*', { count: 'exact', head: true });
  const { count: fC } = await sb.from('fragrances').select('*', { count: 'exact', head: true });
  console.log(`\n\n=== IMPORT COMPLETE — Houses: ${hC}, Fragrances: ${fC} ===\n`);

  if ((fC ?? 0) < 20) {
    console.warn('WARNING: fewer than 20 fragrances imported. Check brands/products tables.');
  }
}

// ── Guard: only self-execute when run directly ────────────────────────────────
if (require.main === module) {
  importFromExisting().catch(err => { console.error(err); process.exit(1); });
}

module.exports = { importFromExisting };
