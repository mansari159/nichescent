import { serverClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import HouseVideoHero from '@/components/HouseVideoHero';
import FragranceCard from '@/components/FragranceCard';
import type { Fragrance } from '@/components/FragranceCard';

export const dynamic = 'force-dynamic';



export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const sb = serverClient();
  const { data } = await sb.from('houses').select('name, story').eq('slug', params.slug).single();
  if (!data) return { title: 'House Not Found' };
  return { title: data.name, description: data.story?.slice(0, 160) ?? undefined };
}

export default async function HousePage({ params }: { params: { slug: string } }) {
  const sb = serverClient();
  const { data: house } = await sb.from('houses').select('*').eq('slug', params.slug).single();
  if (!house) notFound();

  const { data: fragrances } = await sb
    .from('fragrances')
    .select('*')
    .eq('house_id', house.id)
    .eq('is_active', true)
    .order('rank_score', { ascending: false })
    .limit(48);

  return (
    <>
      {/* Video / parallax hero */}
      <HouseVideoHero
        cityName={house.video_city ?? house.origin_city ?? house.origin_country ?? 'dubai'}
        houseName={house.name}
        storyLine={house.signature_dna ?? undefined}
        fallbackImage="/placeholder.jpg"
      />

      {/* Cream zone — house story + fragrances */}
      <div style={{ backgroundColor: '#f5ede0' }}>
        <div className="max-w-5xl mx-auto px-8 py-16">
          {/* Story */}
          {house.story && (
            <div className="mb-16 max-w-2xl">
              <p className="font-mono text-[10px] tracking-[0.25em] uppercase mb-4" style={{ color: '#B8762A' }}>
                The House
              </p>
              <p className="font-body text-lg leading-relaxed" style={{ color: '#3a2e22' }}>
                {house.story}
              </p>
            </div>
          )}

          {/* DNA quote */}
          {house.signature_dna && (
            <blockquote className="font-display text-2xl italic mb-16" style={{ color: '#1e1610', borderLeft: '3px solid #B8762A', paddingLeft: '1.5rem' }}>
              {house.signature_dna}
            </blockquote>
          )}

          {/* Fragrance grid */}
          <h2 className="font-mono text-[10px] tracking-[0.25em] uppercase mb-8" style={{ color: '#8a7560' }}>
            Fragrances ({fragrances?.length ?? 0})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px">
            {(fragrances ?? []).map((f, i) => (
              <Link key={f.id} href={`/fragrance/${f.slug}`}>
                <FragranceCard fragrance={f as Fragrance} priority={i < 4} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
