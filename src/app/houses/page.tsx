import { serverClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Houses' };

const HOUSE_TYPE_ORDER = ['middle_eastern', 'indie', 'niche', 'designer'];
const HOUSE_TYPE_LABEL: Record<string, string> = {
  middle_eastern: 'Middle Eastern', indie: 'Indie', niche: 'Niche', designer: 'Designer',
};



export default async function HousesPage() {
  const sb = serverClient();
  if (!sb) notFound();
  const { data: houses } = await sb
    .from('houses')
    .select('*')
    .order('name');

  const grouped: Record<string, typeof houses> = {};
  for (const h of houses ?? []) {
    const key = h.house_type ?? 'niche';
    if (!grouped[key]) grouped[key] = [];
    grouped[key]!.push(h);
  }

  return (
    <div style={{ backgroundColor: '#0e0b08', minHeight: '100vh' }}>
      {/* Hero */}
      <div className="pt-32 pb-16 px-8 max-w-7xl mx-auto">
        <p className="font-mono text-[10px] tracking-[0.3em] uppercase mb-4" style={{ color: '#B8762A' }}>
          Directory
        </p>
        <h1 className="font-display text-5xl md:text-7xl font-light" style={{ color: '#ede0cc' }}>
          Houses
        </h1>
        <p className="font-body text-lg mt-4 max-w-lg" style={{ color: '#6a5a48' }}>
          Artisan, indie, and regional fragrance houses from 50+ countries.
        </p>
      </div>

      {/* Grouped lists */}
      <div className="px-8 pb-24 max-w-7xl mx-auto">
        {HOUSE_TYPE_ORDER.map(type => {
          const group = grouped[type];
          if (!group?.length) return null;
          return (
            <div key={type} className="mb-16">
              <h2 className="font-mono text-[10px] tracking-[0.25em] uppercase mb-6" style={{ color: '#B8762A' }}>
                {HOUSE_TYPE_LABEL[type]}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px" style={{ border: '1px solid #2a2018' }}>
                {group.map(h => (
                  <Link
                    key={h.id}
                    href={`/house/${h.slug}`}
                    className="p-5 transition-colors duration-200 group"
                    style={{ backgroundColor: '#0e0b08', border: '1px solid #2a2018' }}
                  >
                    <p className="font-display text-lg mb-1 transition-colors duration-200 group-hover:text-[#B8762A]"
                      style={{ color: '#ede0cc' }}>
                      {h.name}
                    </p>
                    {h.origin_country && (
                      <p className="font-mono text-[9px] tracking-widest uppercase" style={{ color: '#6a5a48' }}>
                        {h.origin_country}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
