import { createClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Origins', description: 'Fragrance houses by country of origin.' };

function serverClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export default async function OriginsPage() {
  const sb = serverClient();
  const { data: houses } = await sb
    .from('houses')
    .select('origin_country, id')
    .not('origin_country', 'is', null);

  // Count houses per country
  const countMap: Record<string, number> = {};
  for (const h of houses ?? []) {
    const c = h.origin_country as string;
    countMap[c] = (countMap[c] ?? 0) + 1;
  }

  const countries = Object.entries(countMap)
    .sort((a, b) => b[1] - a[1])
    .map(([code, count]) => ({ code, count }));

  return (
    <div style={{ backgroundColor: '#0e0b08', minHeight: '100vh', paddingTop: '4rem' }}>
      <div className="max-w-7xl mx-auto px-8 py-16">
        <p className="font-mono text-[10px] tracking-[0.3em] uppercase mb-4" style={{ color: '#B8762A' }}>Explore</p>
        <h1 className="font-display text-5xl md:text-7xl font-light mb-4" style={{ color: '#ede0cc' }}>Origins</h1>
        <p className="font-body text-lg mb-16" style={{ color: '#6a5a48' }}>
          Fragrance traditions by country — from Grasse to Kannauj to Dubai.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px">
          {countries.map(({ code, count }) => (
            <Link
              key={code}
              href={`/origin/${code.toLowerCase()}`}
              className="p-6 transition-all duration-200 group"
              style={{ backgroundColor: '#0e0b08', border: '1px solid #2a2018' }}
            >
              <p className="font-display text-2xl mb-1 transition-colors group-hover:text-[#B8762A]"
                style={{ color: '#ede0cc' }}>
                {code}
              </p>
              <p className="font-mono text-[9px] tracking-widest uppercase" style={{ color: '#6a5a48' }}>
                {count} house{count !== 1 ? 's' : ''}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
