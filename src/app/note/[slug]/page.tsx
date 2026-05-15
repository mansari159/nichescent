import { serverClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import FragranceCard from '@/components/FragranceCard';
import type { Fragrance } from '@/components/FragranceCard';

export const dynamic = 'force-dynamic';



export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  return { title: `${params.slug.replace(/-/g, ' ')} fragrances` };
}

export default async function NotePage({ params }: { params: { slug: string } }) {
  const sb = serverClient();
  if (!sb) notFound();
  const noteTerm = params.slug.replace(/-/g, ' ');
  const termLower = noteTerm.toLowerCase();

  // 1. Broad FTS to get candidates
  const { data: candidates } = await sb
    .from('fragrances')
    .select('*')
    .textSearch('search_vector', noteTerm, { type: 'websearch' })
    .order('rank_score', { ascending: false })
    .limit(200);

  // 2. Filter in JS — exact array membership (case-insensitive)
  const fragrances = ((candidates ?? []) as Fragrance[]).filter(f =>
    [...(f.top_notes ?? []), ...(f.heart_notes ?? []), ...(f.base_notes ?? [])]
      .some(n => n.toLowerCase() === termLower || n.toLowerCase().includes(termLower))
  );
  // Zero results: show message — not an error

  return (
    <div style={{ backgroundColor: '#f5ede0', minHeight: '100vh', paddingTop: '4rem' }}>
      <div className="max-w-7xl mx-auto px-8 py-12">
        <p className="font-mono text-[10px] tracking-[0.3em] uppercase mb-4" style={{ color: '#B8762A' }}>Note</p>
        <h1 className="font-display text-5xl font-light mb-2" style={{ color: '#1e1610' }}>{noteTerm}</h1>
        <p className="font-mono text-[9px] tracking-widest uppercase mb-12" style={{ color: '#8a7560' }}>
          {fragrances.length} fragrance{fragrances.length !== 1 ? 's' : ''}
        </p>
        {fragrances.length === 0 ? (
          <p className="font-mono text-[11px] tracking-widest uppercase text-center py-24" style={{ color: '#8a7560' }}>
            No fragrances found with this note.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px">
            {fragrances.map((f, i) => (
              <Link key={f.id} href={`/fragrance/${f.slug}`}>
                <FragranceCard fragrance={f} priority={i < 4} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
