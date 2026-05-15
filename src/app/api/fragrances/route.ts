export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function serverClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  const sb = serverClient();
  const { searchParams } = req.nextUrl;

  const limit         = Math.min(Number(searchParams.get('limit') ?? 24), 48);
  const offset        = Number(searchParams.get('offset') ?? 0);
  const q             = searchParams.get('q') ?? '';
  const houseId       = searchParams.get('house_id') ?? '';
  const houseSlug     = searchParams.get('house_slug') ?? '';
  const country       = searchParams.get('country') ?? '';
  const tier          = searchParams.get('tier') ?? '';
  const houseType     = searchParams.get('house_type') ?? '';
  const gender        = searchParams.get('gender') ?? '';
  const mood          = searchParams.get('mood') ?? '';
  const sort          = searchParams.get('sort') ?? 'rank';
  const includeDesign = searchParams.get('include_designers') === 'true';

  let query = sb
    .from('fragrances')
    .select('*, house:houses(id,name,slug,origin_country,house_type)', { count: 'exact' })
    .eq('is_active', true);

  if (q)          query = query.textSearch('search_vector', q, { type: 'websearch' });
  if (houseId)    query = query.eq('house_id', houseId);
  if (houseSlug)  query = query.eq('houses.slug', houseSlug);
  if (tier)       query = query.eq('tier', tier);
  if (gender)     query = query.eq('gender', gender);
  if (mood)       query = query.contains('mood_tags', [mood]);

  if (houseType) {
    const types = houseType.split(',').map(t => t.trim()).filter(Boolean);
    if (types.length === 1) query = query.eq('house_type', types[0]);
    else                    query = query.in('house_type', types);
  }

  if (country) {
    // filter via house join
    query = query.eq('houses.origin_country', country);
  }

  if (!includeDesign && !houseType) {
    query = query.neq('house_type', 'designer');
  }

  // Sort
  switch (sort) {
    case 'new':    query = query.order('created_at', { ascending: false }); break;
    case 'rating': query = query.order('community_rating', { ascending: false }); break;
    case 'name':   query = query.order('name'); break;
    default:       query = query.order('rank_score', { ascending: false }); break;
  }

  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ fragrances: data ?? [], total: count ?? 0 });
}
