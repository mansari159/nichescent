'use strict';
/**
 * RareTrace — Seed 6 clone pairs (Phase 4)
 * Clones are linked to originals via clone_of FK.
 * Safe to re-run (ignoreDuplicates: true).
 *
 * Run: node scripts/seed-clones.js
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function slugify(str) {
  return String(str).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function rankScore(houseType, community = 0) {
  const base = { middle_eastern: 30, indie: 28, niche: 25, clone: 15, designer: -20 }[houseType] ?? 0;
  return base + community * 8;
}

const CLONE_PAIRS = [
  {
    original: { name: 'Aventus', house: 'Creed', house_type: 'niche', origin_country: 'FR', community_rating: 8.5, gender: 'masculine', tier: 'luxury', top_notes: ['blackcurrant','bergamot','apple','pineapple'], heart_notes: ['birch','patchouli','rose','jasmine'], base_notes: ['oakmoss','ambergris','musk','vanilla'] },
    clone:    { name: 'Club de Nuit Intense Man', house: 'Armaf', house_type: 'clone', origin_country: 'AE', community_rating: 7.5, gender: 'masculine', tier: 'budget', similarity_score: 0.87, top_notes: ['blackcurrant','bergamot','apple','pineapple'], heart_notes: ['birch','rose','jasmine'], base_notes: ['oakmoss','ambergris','musk'] },
  },
  {
    original: { name: 'Baccarat Rouge 540', house: 'Maison Francis Kurkdjian', house_type: 'niche', origin_country: 'FR', community_rating: 9.0, gender: 'unisex', tier: 'luxury', top_notes: ['saffron','jasmine'], heart_notes: ['amberwood','ambergris'], base_notes: ['fir resin','cedar'] },
    clone:    { name: "Bade'e Al Oud Sublime", house: 'Lattafa', house_type: 'clone', origin_country: 'AE', community_rating: 7.8, gender: 'unisex', tier: 'budget', similarity_score: 0.78, top_notes: ['saffron','jasmine'], heart_notes: ['amberwood','ambergris'], base_notes: ['cedar','musk'] },
  },
  {
    original: { name: 'Sauvage EDP', house: 'Dior', house_type: 'designer', origin_country: 'FR', community_rating: 8.2, gender: 'masculine', tier: 'mid', top_notes: ['pepper','bergamot'], heart_notes: ['lavender','star anise','cedar'], base_notes: ['ambroxan','vanilla','labdanum'] },
    clone:    { name: 'Voyage', house: 'Armaf', house_type: 'clone', origin_country: 'AE', community_rating: 6.5, gender: 'masculine', tier: 'budget', similarity_score: 0.82, top_notes: ['pepper','bergamot'], heart_notes: ['lavender','cedar'], base_notes: ['ambroxan','musk'] },
  },
  {
    original: { name: 'Bleu de Chanel EDP', house: 'Chanel', house_type: 'designer', origin_country: 'FR', community_rating: 8.4, gender: 'masculine', tier: 'mid', top_notes: ['lemon','mint','pink pepper'], heart_notes: ['ginger','iso e super','jasmine'], base_notes: ['labdanum','sandalwood','patchouli'] },
    clone:    { name: 'Asad', house: 'Lattafa', house_type: 'clone', origin_country: 'AE', community_rating: 7.2, gender: 'masculine', tier: 'budget', similarity_score: 0.80, top_notes: ['lemon','bergamot','pink pepper'], heart_notes: ['jasmine','cedar'], base_notes: ['sandalwood','musk','patchouli'] },
  },
  {
    original: { name: 'Tobacco Vanille', house: 'Tom Ford', house_type: 'niche', origin_country: 'US', community_rating: 8.8, gender: 'unisex', tier: 'luxury', top_notes: ['tobacco leaf','spices'], heart_notes: ['tobacco blossom','jasmine','vanilla'], base_notes: ['dried fruits','wood sap','beeswax'] },
    clone:    { name: 'Sultan', house: 'Al-Rehab', house_type: 'clone', origin_country: 'SA', community_rating: 6.9, gender: 'unisex', tier: 'budget', similarity_score: 0.75, top_notes: ['tobacco','spices'], heart_notes: ['vanilla','jasmine'], base_notes: ['musk','sandalwood'] },
  },
  {
    original: { name: 'Green Irish Tweed', house: 'Creed', house_type: 'niche', origin_country: 'FR', community_rating: 8.6, gender: 'masculine', tier: 'luxury', top_notes: ['lemon verbena','iris'], heart_notes: ['violet leaves','sandalwood'], base_notes: ['ambergris','white musk'] },
    clone:    { name: 'La Yuqawam', house: 'Rasasi', house_type: 'clone', origin_country: 'AE', community_rating: 7.4, gender: 'masculine', tier: 'budget', similarity_score: 0.84, top_notes: ['lemon verbena','bergamot'], heart_notes: ['violet leaves','cedar'], base_notes: ['musk','ambergris'] },
  },
];

async function ensureHouse(name, country, houseType) {
  const slug = slugify(name);
  const { data: existing } = await sb.from('houses').select('id').eq('slug', slug).single();
  if (existing) return existing.id;

  const { data, error } = await sb
    .from('houses')
    .insert({ name, slug, origin_country: country, house_type: houseType })
    .select('id')
    .single();
  if (error) throw new Error(`ensureHouse(${name}): ${error.message}`);
  return data.id;
}

async function ensureFragrance(frag, houseId) {
  const slug = slugify(`${frag.house}-${frag.name}`);
  const { data: existing } = await sb.from('fragrances').select('id').eq('slug', slug).single();
  if (existing) return existing.id;

  const ht = frag.house_type;
  const rs = rankScore(ht, frag.community_rating);
  const tier = frag.tier ?? 'mid';

  const { data, error } = await sb
    .from('fragrances')
    .insert({
      name:             frag.name,
      slug,
      house_id:         houseId,
      house_name:       frag.house,
      gender:           frag.gender ?? 'unisex',
      top_notes:        frag.top_notes    ?? [],
      heart_notes:      frag.heart_notes  ?? [],
      base_notes:       frag.base_notes   ?? [],
      house_type:       ht,
      tier,
      community_rating: frag.community_rating ?? 0,
      rank_score:       rs,
      is_active:        true,
    })
    .select('id')
    .single();
  if (error) throw new Error(`ensureFragrance(${frag.name}): ${error.message}`);
  return data.id;
}

async function main() {
  console.log('\n═══════════════════════════════════════');
  console.log('  RareTrace — Phase 4: Seed Clones');
  console.log('═══════════════════════════════════════\n');

  for (const pair of CLONE_PAIRS) {
    const { original, clone } = pair;
    try {
      const origHouseId  = await ensureHouse(original.house, original.origin_country, original.house_type);
      const origId       = await ensureFragrance(original, origHouseId);

      const cloneHouseId = await ensureHouse(clone.house, clone.origin_country, 'niche');
      const cloneSlug    = slugify(`${clone.house}-${clone.name}`);

      const { data: existingClone } = await sb.from('fragrances').select('id').eq('slug', cloneSlug).single();
      if (!existingClone) {
        const rs = rankScore('clone', clone.community_rating);
        const { error } = await sb.from('fragrances').insert({
          name:             clone.name,
          slug:             cloneSlug,
          house_id:         cloneHouseId,
          house_name:       clone.house,
          gender:           clone.gender ?? 'unisex',
          top_notes:        clone.top_notes    ?? [],
          heart_notes:      clone.heart_notes  ?? [],
          base_notes:       clone.base_notes   ?? [],
          house_type:       'clone',
          tier:             clone.tier ?? 'budget',
          clone_of:         origId,
          similarity_score: clone.similarity_score ?? null,
          community_rating: clone.community_rating ?? 0,
          rank_score:       rs,
          is_active:        true,
        });
        if (error) throw new Error(`insert clone (${clone.name}): ${error.message}`);
      } else {
        // Ensure clone_of is linked even if row already existed
        await sb.from('fragrances').update({ clone_of: origId, house_type: 'clone' }).eq('id', existingClone.id);
      }
      console.log(`  ✓ ${original.name} → ${clone.name} (${(clone.similarity_score ?? 0) * 100}%)`);
    } catch (err) {
      console.error(`  ✗ ${original.name}: ${err.message}`);
    }
  }

  const { count } = await sb
    .from('fragrances')
    .select('*', { count: 'exact', head: true })
    .not('clone_of', 'is', null);
  console.log(`\n✓ Clone pairs seeded. Fragrances with clone_of: ${count}\n`);

  if ((count ?? 0) < 6) {
    console.warn('WARNING: fewer than 6 clone rows. Check errors above.');
  }
}

main().catch(err => { console.error(err); process.exit(1); });
