'use strict';
/**
 * RareTrace — Claude Haiku enrichment (Phase 5)
 * Skipped if ANTHROPIC_API_KEY is not set.
 * Run multiple times — processes 100 unenriched fragrances per run.
 *
 * Run: node scripts/enrich-claude.js
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const Anthropic = require('@anthropic-ai/sdk');

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.log('Phase 5 SKIPPED — ANTHROPIC_API_KEY not set in .env.local');
  console.log('Add it and re-run: node scripts/enrich-claude.js');
  process.exit(0);
}

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const anthropic = new Anthropic({ apiKey: API_KEY });

const MOOD_OPTIONS     = ['cozy','seductive','confident','fresh','meditative','bold','playful','mysterious','elegant','adventurous','romantic','professional'];
const OCCASION_OPTIONS = ['date_night','office','casual','evening','formal','sport','weekend','special_occasion','travel'];
const SEASON_OPTIONS   = ['spring','summer','fall','winter'];

async function enrichFragrance(frag) {
  const notes = [
    frag.top_notes?.length   ? `Top: ${frag.top_notes.join(', ')}`         : '',
    frag.heart_notes?.length ? `Heart: ${frag.heart_notes.join(', ')}`     : '',
    frag.base_notes?.length  ? `Base: ${frag.base_notes.join(', ')}`       : '',
    frag.main_accords?.length? `Accords: ${frag.main_accords.join(', ')}`  : '',
  ].filter(Boolean).join(' | ');

  const prompt = `Fragrance: "${frag.name}" by ${frag.house_name}
House type: ${frag.house_type} | Year: ${frag.year ?? 'unknown'} | Gender: ${frag.gender ?? 'unisex'}
Notes: ${notes || 'not specified'} | Community rating: ${frag.community_rating ?? 'not rated'}

Respond with ONLY valid JSON (no markdown, no explanation):
{
  "plain_description": "2-3 plain-English sentences for first-time buyers. No purple prose. Be specific about smell.",
  "mood_tags": ["up to 4 from: ${MOOD_OPTIONS.join(', ')}"],
  "occasion_tags": ["up to 3 from: ${OCCASION_OPTIONS.join(', ')}"],
  "season_tags": ["up to 3 from: ${SEASON_OPTIONS.join(', ')}"],
  "editorial_score": 0.0,
  "house_type": "${frag.house_type}"
}

editorial_score rules: 0-10 float. +8-10 for rare/celebrated indie/ME houses. +5-7 for respected niche. +3-5 for mainstream niche. +1-3 for designer.
house_type: only reclassify if clearly wrong. Keep "${frag.house_type}" if unsure.`;

  const res = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    messages: [{ role: 'user', content: prompt }],
  });

  if (res.content[0].type !== 'text') throw new Error(`Unexpected type: ${res.content[0].type}`);
  return JSON.parse(res.content[0].text.trim());
}

async function main() {
  console.log('\n═══════════════════════════════════════');
  console.log('  RareTrace — Phase 5: Enrichment');
  console.log('═══════════════════════════════════════\n');

  // Fetch unenriched fragrances — skip clones
  const { data: fragrances, error } = await sb
    .from('fragrances')
    .select('id, name, house_name, house_type, year, gender, top_notes, heart_notes, base_notes, main_accords, community_rating')
    .is('plain_description', null)
    .is('clone_of', null)
    .limit(100);

  if (error) { console.error('fetch error:', error.message); process.exit(1); }
  if (!fragrances?.length) { console.log('All fragrances already enriched. Done.'); process.exit(0); }

  console.log(`Enriching ${fragrances.length} fragrances…`);
  let success = 0, failed = 0;

  for (const frag of fragrances) {
    try {
      const enriched = await enrichFragrance(frag);
      const { error: uErr } = await sb
        .from('fragrances')
        .update({
          plain_description: enriched.plain_description,
          mood_tags:         enriched.mood_tags ?? [],
          occasion_tags:     enriched.occasion_tags ?? [],
          season_tags:       enriched.season_tags ?? [],
          editorial_score:   enriched.editorial_score ?? 0,
          house_type:        enriched.house_type ?? frag.house_type,
        })
        .eq('id', frag.id);
      if (uErr) throw new Error(uErr.message);
      success++;
      process.stdout.write(`\r  ✓ ${success} enriched, ${failed} failed`);
      await new Promise(r => setTimeout(r, 350)); // rate-limit
    } catch (err) {
      failed++;
      console.warn(`\n  ✗ ${frag.house_name} ${frag.name} —`, err.message);
    }
  }
  console.log(`\n\n✓ Enrichment: ${success} success, ${failed} failed. Re-run for next batch.\n`);
}

main().catch(err => { console.error(err); process.exit(1); });
