import { serverClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import NotesPyramid from '@/components/NotesPyramid';
import TierPill from '@/components/TierPill';
import { getAffiliateUrl } from '@/components/FragranceCard';

export const dynamic = 'force-dynamic';



export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const sb = serverClient();
  if (!sb) return {};
  const { data } = await sb.from('fragrances').select('name, house_name, plain_description').eq('slug', params.slug).single();
  if (!data) return { title: 'Fragrance Not Found' };
  return {
    title: `${data.name} — ${data.house_name ?? ''}`,
    description: data.plain_description?.slice(0, 160) ?? undefined,
  };
}

export default async function FragrancePage({ params }: { params: { slug: string } }) {
  const sb = serverClient();
  if (!sb) notFound();
  const { data: frag } = await sb
    .from('fragrances')
    .select('*, house:houses(*)')
    .eq('slug', params.slug)
    .single();
  if (!frag) notFound();

  // Clone backlink
  let original = null;
  if (frag.clone_of) {
    const { data } = await sb
      .from('fragrances')
      .select('name, slug, house_name')
      .eq('id', frag.clone_of)
      .single();
    original = data;
  }

  const affiliateUrl = getAffiliateUrl(frag.affiliate_links);
  const img = frag.image_url || frag.image_path || '/placeholder.jpg';

  return (
    <div style={{ backgroundColor: 'var(--cream-bg)', minHeight: '100vh', paddingTop: '4rem' }}>
      <div className="max-w-5xl mx-auto px-8 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          <Link href="/discover" className="font-mono text-[9px] tracking-widest uppercase" style={{ color: 'var(--cream-text)' }}>Discover</Link>
          <span className="font-mono text-[9px]" style={{ color: 'var(--cream-border)' }}>›</span>
          {frag.house && (
            <>
              <Link href={`/house/${frag.house.slug}`} className="font-mono text-[9px] tracking-widest uppercase" style={{ color: 'var(--cream-text)' }}>
                {frag.house_name}
              </Link>
              <span className="font-mono text-[9px]" style={{ color: 'var(--cream-border)' }}>›</span>
            </>
          )}
          <span className="font-mono text-[9px] tracking-widest uppercase" style={{ color: 'var(--cream-heading)' }}>{frag.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image */}
          <div className="relative w-full" style={{ aspectRatio: '3/4' }}>
            <Image src={img} alt={frag.name} fill className="object-cover" priority
              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }} />
          </div>

          {/* Details */}
          <div>
            <TierPill tier={frag.tier} className="mb-3" />
            <h1 className="font-display text-4xl font-light leading-tight mb-2" style={{ color: 'var(--cream-heading)' }}>
              {frag.name}
            </h1>
            {frag.house_name && (
              <Link href={`/house/${frag.house?.slug ?? '#'}`}>
                <p className="font-mono text-[10px] tracking-widest uppercase mb-6 transition-colors" style={{ color: 'var(--cream-text)' }}>
                  {frag.house_name}
                </p>
              </Link>
            )}

            {/* Clone backlink */}
            {original && (
              <div className="mb-6 p-4" style={{ backgroundColor: 'var(--cream-surface)', border: '1px solid var(--cream-border)' }}>
                <p className="font-mono text-[9px] tracking-widest uppercase mb-1" style={{ color: 'var(--dark-muted)' }}>Clone of</p>
                <Link href={`/fragrance/${original.slug}`} className="font-display text-lg transition-colors" style={{ color: 'var(--cream-heading)' }}>
                  {original.name} — {original.house_name}
                </Link>
              </div>
            )}

            {/* Meta */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Year',   value: frag.year ?? '—' },
                { label: 'Gender', value: frag.gender ?? '—' },
                { label: 'Rating', value: frag.community_rating ? `${frag.community_rating}/10` : '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{ borderLeft: '2px solid var(--cream-border)', paddingLeft: '12px' }}>
                  <p className="font-mono text-[8px] tracking-widest uppercase mb-1" style={{ color: 'var(--cream-text)' }}>{label}</p>
                  <p className="font-mono text-sm" style={{ color: 'var(--cream-heading)' }}>{String(value)}</p>
                </div>
              ))}
            </div>

            {frag.plain_description ? (
              <p className="font-body text-base leading-relaxed mb-6" style={{ color: 'var(--cream-text)' }}>
                {frag.plain_description}
              </p>
            ) : (
              <p className="font-body text-base leading-relaxed mb-6 italic" style={{ color: 'var(--cream-text)', opacity: 0.6 }}>
                No description available yet.
              </p>
            )}

            {/* Mood tags */}
            {frag.mood_tags?.length > 0 && (
              <div className="mb-3">
                <p className="font-mono text-[8px] tracking-widest uppercase mb-2" style={{ color: 'var(--cream-text)' }}>Mood</p>
                <div className="flex flex-wrap gap-2">
                  {frag.mood_tags.map((t: string) => (
                    <span key={t} className="font-mono text-[9px] tracking-widest uppercase px-2 py-1"
                      style={{ border: '1px solid var(--cream-border)', color: 'var(--cream-text)' }}>{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Occasion tags */}
            {frag.occasion_tags?.length > 0 && (
              <div className="mb-3">
                <p className="font-mono text-[8px] tracking-widest uppercase mb-2" style={{ color: 'var(--cream-text)' }}>Occasion</p>
                <div className="flex flex-wrap gap-2">
                  {frag.occasion_tags.map((t: string) => (
                    <span key={t} className="font-mono text-[9px] tracking-widest uppercase px-2 py-1"
                      style={{ border: '1px solid var(--cream-border)', color: 'var(--cream-text)' }}>{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Season tags */}
            {frag.season_tags?.length > 0 && (
              <div className="mb-6">
                <p className="font-mono text-[8px] tracking-widest uppercase mb-2" style={{ color: 'var(--cream-text)' }}>Season</p>
                <div className="flex flex-wrap gap-2">
                  {frag.season_tags.map((t: string) => (
                    <span key={t} className="font-mono text-[9px] tracking-widest uppercase px-2 py-1"
                      style={{ border: '1px solid var(--cream-border)', color: 'var(--cream-text)' }}>{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Spacer if no tags shown */}
            {!frag.mood_tags?.length && !frag.occasion_tags?.length && !frag.season_tags?.length && (
              <div className="mb-6" />
            )}

            {/* Affiliate CTA — conditional */}
            {affiliateUrl ? (
              <a href={affiliateUrl} target="_blank" rel="noopener noreferrer nofollow"
                className="block w-full text-center font-mono text-[11px] tracking-widest uppercase py-4 mb-4 transition-colors"
                style={{ backgroundColor: 'var(--amber)', color: 'var(--dark-bg)' }}>
                Buy Now
              </a>
            ) : (
              <p className="font-mono text-[10px] tracking-widest uppercase text-center py-4 mb-4" style={{ color: 'var(--cream-text)' }}>
                Link coming soon
              </p>
            )}

            <Link href="/clones" className="font-mono text-[9px] tracking-widest uppercase" style={{ color: 'var(--cream-text)' }}>
              Browse clone alternatives →
            </Link>
          </div>
        </div>

        {/* Notes pyramid */}
        <div className="mt-16 pt-16" style={{ borderTop: '1px solid var(--cream-border)' }}>
          <p className="font-mono text-[10px] tracking-[0.25em] uppercase mb-8" style={{ color: 'var(--amber)' }}>Fragrance Profile</p>
          <div className="max-w-lg mx-auto">
            <NotesPyramid top={frag.top_notes ?? []} heart={frag.heart_notes ?? []} base={frag.base_notes ?? []} />
          </div>
        </div>
      </div>
    </div>
  );
}
