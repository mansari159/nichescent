'use strict';
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.log('SKIPPED — ANTHROPIC_API_KEY not set in .env.local');
  process.exit(0);
}

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const MOOD_OPTIONS     = ['cozy','seductive','confident','fresh','meditative','bold','playful','mysterious','elegant','adventurous','romantic','professional'];
const OCCASION_OPTIONS = ['date_night','office','casual','evening','formal','sport','weekend','special_occasion','travel'];
const SEASON_OPTIONS   = ['spring','summer','fall','winter'];

// ── Call Anthropic via raw fetch (avoids SDK version issues) ─────────────────
async function callClaude(prompt) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 450,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }
  const data = await res.json();
  return data.content[0].text.trim();
}

// ── Strip markdown code fences if Claude adds them ───────────────────────────
function extractJSON(raw) {
  // Remove ```json ... ``` or ``` ... ``` wrappers
  const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
  return JSON.parse(stripped);
}

async function enrichFragrance(frag) {
  const notes = [
    frag.top_notes?.length    ? `Top: ${frag.top_notes.join(', ')}`         : '',
    frag.heart_notes?.length  ? `Heart: ${frag.heart_notes.join(', ')}`     : '',
    frag.base_notes?.length   ? `Base: ${frag.base_notes.join(', ')}`       : '',
    frag.main_accords?.length ? `Accords: ${frag.main_accords.join(', ')}`  : '',
  ].filter(Boolean).join(' | ');

  const prompt = `Fragrance: "${frag.name}" by ${frag.house_name}
House type: ${frag.house_type} | Year: ${frag.year ?? 'unknown'} | Gender: ${frag.gender ?? 'unisex'}
Notes: ${notes || 'not specified'} | Community rating: ${frag.community_rating ?? 'not rated'}

Respond ONLY with raw JSON (no markdown, no backticks, no explanation):
{"plain_description":"2-3 plain-English sentences for first-time buyers. Be specific about the smell.","mood_tags":["up to 4 from: ${MOOD_OPTIONS.join(', ')}"],"occasion_tags":["up to 3 from: ${OCCASION_OPTIONS.join(', ')}"],"season_tags":["up to 3 from: ${SEASON_OPTIONS.join(', ')}"],"editorial_score":7.0,"house_type":"${frag.house_type}"}

editorial_score: 0-10 float. 8-10 = celebrated indie/ME houses. 5-7 = respected niche. 3-5 = mainstream niche. 1-3 = designer.
house_type: keep "${frag.house_type}" unless clearly wrong.`;

  const raw = await callClaude(prompt);
  return extractJSON(raw);
}

async function main() {
  console.log('\n═══════════════════════════════════════');
  console.log('  NicheScent — Enrichment');
  console.log('═══════════════════════════════════════\n');

  // Quick API test before processing batch
  console.log('  Testing API connection...');
  try {
    const test = await callClaude('Reply with exactly: {"ok":true}');
    extractJSON(test);
    console.log('  API OK\n');
  } catch (err) {
    console.error('  API test FAILED:', err.message);
    console.error('  Check ANTHROPIC_API_KEY in .env.local and try again.');
    process.exit(1);
  }

  const { data: fragrances, error } = await sb
    .from('fragrances')
    .select('id, name, house_name, house_type, year, gender, top_notes, heart_notes, base_notes, main_accords, community_rating')
    .is('plain_description', null)
    .is('clone_of', null)
    .limit(100);

  if (error) { console.error('Supabase fetch error:', error.message); process.exit(1); }
  if (!fragrances?.length) { console.log('All fragrances already enriched.'); process.exit(0); }

  console.log(`  Enriching ${fragrances.length} fragrances...\n`);
  let success = 0, failed = 0;

  for (const frag of fragrances) {
    try {
      const enriched = await enrichFragrance(frag);
      const { error: uErr } = await sb
        .from('fragrances')
        .update({
          plain_description: enriched.plain_description,
          mood_tags:         enriched.mood_tags         ?? [],
          occasion_tags:     enriched.occasion_tags     ?? [],
          season_tags:       enriched.season_tags       ?? [],
          editorial_score:   enriched.editorial_score   ?? 0,
          house_type:        enriched.house_type        ?? frag.house_type,
        })
        .eq('id', frag.id);
      if (uErr) throw new Error(uErr.message);
      success++;
      process.stdout.write(`\r  ${success} enriched, ${failed} failed — ${frag.house_name}: ${frag.name.slice(0,30)}`);
      await new Promise(r => setTimeout(r, 300));
    } catch (err) {
      failed++;
      if (failed <= 3) console.error(`\n  ✗ ${frag.house_name} — ${frag.name}: ${err.message}`);
    }
  }

  console.log(`\n\n  Done: ${success} enriched, ${failed} failed.`);
  if (success > 0) console.log('  Re-run to process next batch.\n');
}

main().catch(err => { console.error(err); process.exit(1); });
