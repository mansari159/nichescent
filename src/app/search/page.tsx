import { Suspense } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';
import Link from 'next/link';
import FragranceCard from '@/components/FragranceCard';
import FilterPanel from '@/components/FilterPanel';
import SearchBar from '@/components/SearchBar';
import type { Fragrance } from '@/components/FragranceCard';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Search' };

function serverClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getResults(sp: Record<string, string>) {
  const sb = serverClient();
  let query = sb.from('fragrances').select('*', { count: 'exact' }).eq('is_active', true);
  if (sp.q)          query = query.textSearch('search_vector', sp.q, { type: 'websearch' });
  if (sp.tier)       query = query.eq('tier', sp.tier);
  if (sp.house_type) query = query.eq('house_type', sp.house_type);
  if (sp.gender)     query = query.eq('gender', sp.gender);
  switch (sp.sort) {
    case 'new':    query = query.order('created_at', { ascending: false }); break;
    case 'rating': query = query.order('community_rating', { ascending: false }); break;
    case 'name':   query = query.order('name'); break;
    default:       query = query.order('rank_score', { ascending: false }); break;
  }
  const { data, count } = await query.range(0, 47);
  return { fragrances: (data ?? []) as Fragrance[], total: count ?? 0 };
}

export default async function SearchPage({ searchParams }: { searchParams: Record<string, string> }) {
  const { fragrances, total } = await getResults(searchParams);
  const q = searchParams.q ?? '';

  return (
    <div style={{ backgroundColor: '#0e0b08', minHeight: '100vh', paddingTop: '4rem' }}>
      <div className="max-w-7xl mx-auto px-8 py-12">
        <SearchBar variant="dark" className="mb-6 max-w-2xl" />
        <Suspense><FilterPanel className="mb-8" /></Suspense>
        <p className="font-mono text-[9px] tracking-widest uppercase mb-8" style={{ color: '#6a5a48' }}>
          {total} fragrance{total !== 1 ? 's' : ''}{q ? ` matching "${q}"` : ''}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px">
          {fragrances.map((f, i) => (
            <Link key={f.id} href={`/fragrance/${f.slug}`}>
              <FragranceCard fragrance={f} priority={i < 4} />
            </Link>
          ))}
        </div>
        {fragrances.length === 0 && (
          <p className="font-mono text-[11px] tracking-widest uppercase text-center py-24" style={{ color: '#6a5a48' }}>
            No fragrances found — try a different search.
          </p>
        )}
      </div>
    </div>
  );
}
