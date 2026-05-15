'use strict';
/**
 * NicheScent — Kaggle Fragrantica Import (fra_cleaned.csv)
 * Columns: url;Perfume;Brand;Country;Gender;Rating Value;Rating Count;Year;Top;Middle;Base;Perfumer1;Perfumer2;mainaccord1..5
 * Run: node scripts/import-kaggle.js
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { parse } = require('csv-parse/sync');
const fs = require('fs');
const path = require('path');

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── Helpers ───────────────────────────────────────────────────────────────────
function slugify(str) {
  return (str || '').toLowerCase()
    .replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim().slice(0, 80);
}

const BRAND_OVERRIDES = {
  'yves-saint-laurent': 'Yves Saint Laurent',
  'jean-paul-gaultier': 'Jean Paul Gaultier',
  'christian-dior': 'Christian Dior',
  'dolce-gabbana': 'Dolce & Gabbana',
  'tom-ford': 'Tom Ford',
  'viktor-rolf': 'Viktor & Rolf',
  'thierry-mugler': 'Thierry Mugler',
  'paco-rabanne': 'Paco Rabanne',
  'calvin-klein': 'Calvin Klein',
  'ralph-lauren': 'Ralph Lauren',
  'hugo-boss': 'Hugo Boss',
  'marc-jacobs': 'Marc Jacobs',
  'michael-kors': 'Michael Kors',
  'jimmy-choo': 'Jimmy Choo',
  'jo-malone-london': 'Jo Malone London',
  'jo-malone': 'Jo Malone',
  'maison-margiela': 'Maison Margiela',
  'al-haramain': 'Al Haramain',
  'swiss-arabian': 'Swiss Arabian',
  'fragrance-world': 'Fragrance World',
  'roja-dove': 'Roja Dove',
  'serge-lutens': 'Serge Lutens',
  'frederic-malle': 'Frederic Malle',
};

function slugToName(slug) {
  if (!slug) return '';
  const lower = slug.toLowerCase().trim();
  if (BRAND_OVERRIDES[lower]) return BRAND_OVERRIDES[lower];
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function looksLikeSlug(s) {
  return s === s.toLowerCase() && s.includes('-');
}

function parseNotes(raw) {
  if (!raw) return [];
  return raw.split(',').map(n => n.trim()).filter(Boolean);
}

function inferHouseType(brand) {
  const name = (brand || '').toLowerCase();
  const meKeywords = ['lattafa','ajmal','rasasi','armaf','fragrance world','al haramain',
    'swiss arabian','orientica','oud','arabic','gulf','khaleeji'];
  if (meKeywords.some(k => name.includes(k))) return 'middle_eastern';
  const bigDesigners = ['chanel','dior','gucci','prada','versace','armani','hugo boss',
    'calvin klein','ralph lauren','yves saint laurent','dolce','givenchy','burberry',
    'lancome','chloe','marc jacobs','jimmy choo','michael kors','coach','tom ford',
    'jean paul gaultier','paco rabanne','thierry mugler','valentino','hermes','cartier',
    'bvlgari','bulgari','davidoff','lacoste','nautica','antonio banderas','bruno banani'];
  if (bigDesigners.some(k => name.includes(k))) return 'designer';
  return 'niche';
}

function computeRankScore(houseType, rating, ratingCount) {
  const base = { middle_eastern: 30, indie: 28, niche: 25, clone: 15, designer: -20 }[houseType] || 0;
  const community = Math.min((rating || 0) / 5, 5);
  const popularity = Math.min(Math.log10((ratingCount || 1) + 1), 5);
  return base + community * 8 + popularity * 3;
}

function inferGender(name, notes) {
  const text = ((name || '') + ' ' + (notes || '')).toLowerCase();
  const femWords = ['floral','rose','jasmine','lily','peony','iris','feminine','women','pour femme','elle'];
  const mascWords = ['woody','leather','tobacco','vetiver','masculine','men','pour homme','cedar'];
  const femScore = femWords.filter(w => text.includes(w)).length;
  const mascScore = mascWords.filter(w => text.includes(w)).length;
  if (femScore > mascScore + 1) return 'feminine';
  if (mascScore > femScore + 1) return 'masculine';
  return 'unisex';
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n══════════════════════════════════════════');
  console.log('  NicheScent — Kaggle Fragrantica Import');
  console.log('══════════════════════════════════════════\n');

  const csvPath = path.join(__dirname, '..', 'data', 'fragrantica.csv');
  if (!fs.existsSync(csvPath)) {
    console.error('CSV not found at:', csvPath);
    process.exit(1);
  }

  console.log('  Reading:', csvPath);
  const raw = fs.readFileSync(csvPath, 'utf8');
  const firstLine = raw.split('\n')[0];
  const delimiter = firstLine.includes(';') ? ';' : ',';
  console.log('  Delimiter:', delimiter);
  const rows = parse(raw, { columns: true, skip_empty_lines: true, trim: true, delimiter });
  console.log('  Rows parsed:', rows.length, '\n');

  // ── Collect unique houses ──────────────────────────────────────────────────
  const houseMap = new Map();
  for (const row of rows) {
    const brandRaw = (row.Brand || row.brand || row.Designer || '').trim();
    if (!brandRaw) continue;
    const brand = looksLikeSlug(brandRaw) ? slugToName(brandRaw) : brandRaw;
    if (houseMap.has(brand)) continue;
    const slug = slugify(brandRaw);
    const houseType = inferHouseType(brand);
    houseMap.set(brand, { name: brand, slug, house_type: houseType });
  }

  console.log('  Upserting', houseMap.size, 'houses...');
  const houseArr = Array.from(houseMap.values());
  for (let i = 0; i < houseArr.length; i += 100) {
    const { error } = await sb.from('houses').upsert(houseArr.slice(i, i + 100), { onConflict: 'slug' });
    if (error) console.error('  House upsert error:', error.message);
  }
  console.log('  Houses done.\n');

  // ── Fetch house IDs ────────────────────────────────────────────────────────
  const { data: houseRows } = await sb.from('houses').select('id, name, slug');
  const houseByName = new Map((houseRows || []).map(h => [h.name, h]));
  const houseBySlug = new Map((houseRows || []).map(h => [h.slug, h]));

  // ── Import fragrances ──────────────────────────────────────────────────────
  console.log('  Importing', rows.length, 'fragrances in batches of 200...');
  let imported = 0, skipped = 0;

  for (let i = 0; i < rows.length; i += 200) {
    const chunk = rows.slice(i, i + 200);
    const payload = [];

    for (const row of chunk) {
      const nameRaw  = (row.Perfume || row.Name || row.name || '').trim();
      const brandRaw = (row.Brand || row.brand || row.Designer || '').trim();
      if (!nameRaw || !brandRaw) { skipped++; continue; }

      const name  = looksLikeSlug(nameRaw)  ? slugToName(nameRaw)  : nameRaw;
      const brand = looksLikeSlug(brandRaw) ? slugToName(brandRaw) : brandRaw;
      const slug  = slugify(brandRaw + '-' + nameRaw);

      const house     = houseByName.get(brand) || houseBySlug.get(slugify(brandRaw));
      const houseType = house ? (house.house_type || 'niche') : inferHouseType(brand);

      const topNotes   = parseNotes(row['Top']    || row['Top Notes']    || '');
      const heartNotes = parseNotes(row['Middle'] || row['Middle Notes'] || row['Heart Notes'] || '');
      const baseNotes  = parseNotes(row['Base']   || row['Base Notes']   || '');

      const accordCols  = ['mainaccord1','mainaccord2','mainaccord3','mainaccord4','mainaccord5'];
      const accordCols2 = ['Main Accord 1','Main Accord 2','Main Accord 3','Main Accord 4','Main Accord 5'];
      let mainAccords = accordCols.map(c => (row[c] || '').trim()).filter(Boolean);
      if (!mainAccords.length) mainAccords = accordCols2.map(c => (row[c] || '').trim()).filter(Boolean);
      if (!mainAccords.length) mainAccords = parseNotes(row['Main Accords'] || '');

      const rating      = parseFloat((row['Rating Value'] || '0').replace(',', '.')) || 0;
      const ratingCount = parseInt((row['Rating Count'] || '0').replace(/[^0-9]/g, '')) || 0;
      const year        = parseInt(row.Year || '0') || null;

      const genderRaw = (row.Gender || '').toLowerCase().trim();
      let gender = 'unisex';
      if (genderRaw.includes('women') || genderRaw === 'female' || genderRaw === 'f') gender = 'feminine';
      else if (genderRaw.includes('men') || genderRaw === 'male' || genderRaw === 'm') gender = 'masculine';
      else if (!genderRaw) gender = inferGender(name, [...topNotes,...heartNotes,...baseNotes].join(' '));

      payload.push({
        name,
        slug,
        house_id:         house ? house.id : null,
        house_name:       brand,
        house_type:       houseType,
        year,
        top_notes:        topNotes,
        heart_notes:      heartNotes,
        base_notes:       baseNotes,
        main_accords:     mainAccords,
        community_rating: rating || null,
        gender,
        tier:             houseType === 'designer' ? 'budget'
                          : houseType === 'middle_eastern' ? 'niche_tier' : 'mid',
        rank_score:       computeRankScore(houseType, rating, ratingCount),
        is_active:        true,
      });
    }

    if (payload.length) {
      const { error } = await sb.from('fragrances').upsert(payload, { onConflict: 'slug' });
      if (error) console.error('  Batch', i, 'error:', error.message);
      else imported += payload.length;
    }
    process.stdout.write('\r  Progress: ' + Math.min(i + 200, rows.length) + '/' + rows.length);
  }

  console.log('\n');
  console.log('  Imported:', imported, '  Skipped:', skipped);

  // ── Verify ─────────────────────────────────────────────────────────────────
  const { count } = await sb.from('fragrances').select('*', { count: 'exact', head: true });
  console.log('  Total in DB:', count);
  console.log('\n  Import complete.\n');
}

main().catch(err => { console.error(err); process.exit(1); });
