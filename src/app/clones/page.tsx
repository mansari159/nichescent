import { serverClient } from '@/lib/supabase-server';
import type { Metadata } from 'next';
import CloneComparisonCard from '@/components/CloneComparisonCard';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Clone Finder',
  description: 'Find affordable alternatives to luxury fragrances. Curated clone pairs with similarity scores.',
};



export default async function ClonesPage() {
  const sb = serverClient();
  if (!sb) return <div />;
  // Self-join via clone_of FK — filter on clone_of IS NOT NULL, not house_type
  const { data: clones } = await sb
    .from('fragrances')
    .select('*, house:houses(*), original:fragrances!clone_of(*, house:houses(*))')
    .not('clone_of', 'is', null)
    .eq('is_active', true)
    .order('similarity_score', { ascending: false });

  return (
    <div style={{ backgroundColor: '#f5ede0', minHeight: '100vh', paddingTop: '4rem' }}>
      {/* Hero */}
      <div className="py-16 px-8 max-w-7xl mx-auto" style={{ borderBottom: '1px solid #e0cdb5' }}>
        <p className="font-mono text-[10px] tracking-[0.3em] uppercase mb-4" style={{ color: '#B8762A' }}>
          Clone Finder
        </p>
        <h1 className="font-display text-5xl md:text-7xl font-light" style={{ color: '#1e1610' }}>
          Smart alternatives
        </h1>
        <p className="font-body text-lg mt-4 max-w-lg" style={{ color: '#8a7560' }}>
          Inspired-by fragrances ranked by similarity. Same DNA, fraction of the price.
        </p>
      </div>

      {/* Clone pairs */}
      <div className="px-8 py-16 max-w-5xl mx-auto">
        {(clones ?? []).length === 0 ? (
          <p className="font-mono text-[11px] tracking-widest uppercase text-center py-24" style={{ color: '#8a7560' }}>
            No clone pairs yet — run node scripts/seed-clones.js to seed them.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(clones ?? []).map(clone => (
              <CloneComparisonCard key={clone.id} clone={clone as any} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
