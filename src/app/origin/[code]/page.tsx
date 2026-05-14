import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import HouseVideoHero from '@/components/HouseVideoHero';
import FragranceCard from '@/components/FragranceCard';
import type { Fragrance } from '@/components/FragranceCard';

export const dynamic = 'force-dynamic';

function serverClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function generateMetadata({ params }: { params: { code: string } }): Promise<Metadata> {
  return { title: `${params.code.toUpperCase()} fragrances` };
}

export default async function OriginPage({ params }: { params: { code: string } }) {
  const sb = serverClient();
  const code = params.code.toUpperCase();

  // Houses from this country
  const { data: houses } = await sb
    .from('houses')
    .select('id, name, slug, house_type')
    .eq('origin_country', code)
    .order('name');

  if (!houses?.length) notFound();

  // Fragrances via house join
  const houseIds = houses.map(h => h.id);
  const { data: fragrances } = await sb
    .from('fragrances')
    .select('*')
    .in('house_id', houseIds)
    .eq('is_active', true)
    .order('rank_score', { ascending: false })
    .limit(48);

  return (
    <>
      <HouseVideoHero
        cityName={code.toLowerCase()}
        houseName={code}
        storyLine={`${houses.length} fragrance house${houses.length !== 1 ? 's' : ''} from ${code}`}
        fallbackImage="/placeholder.jpg"
      />

      <div style={{ backgroundColor: '#f5ede0' }}>
        <div className="max-w-7xl mx-auto px-8 py-16">
          {/* Houses */}
          <div className="mb-16">
            <p className="font-mono text-[10px] tracking-[0.25em] uppercase mb-6" style={{ color: '#B8762A' }}>Houses</p>
            <div className="flex flex-wrap gap-3">
              {houses.map(h => (
                <Link key={h.id} href={`/house/${h.slug}`}
                  className="font-mono text-[10px] tracking-wide uppercase px-4 py-2 transition-colors"
                  style={{ border: '1px solid #e0cdb5', color: '#3a2e22' }}>
                  {h.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Fragrances */}
          <p className="font-mono text-[10px] tracking-[0.25em] uppercase mb-8" style={{ color: '#B8762A' }}>
            Fragrances ({fragrances?.length ?? 0})
          </p>
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
