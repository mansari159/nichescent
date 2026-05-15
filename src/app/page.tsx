import { Suspense } from 'react';
import { serverClient } from '@/lib/supabase-server';
import HomeClient from '@/components/HomeClient';

export const dynamic = 'force-dynamic';

async function getInitialFragrances() {
  try {
    const sb = serverClient();
    if (!sb) return { fragrances: [], total: 0 };
    const { data, count } = await sb
      .from('fragrances')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .neq('house_type', 'designer')
      .order('rank_score', { ascending: false })
      .range(0, 23);
    return { fragrances: data ?? [], total: count ?? 0 };
  } catch (_e) {
    return { fragrances: [], total: 0 };
  }
}

export default async function HomePage() {
  const { fragrances, total } = await getInitialFragrances();
  return (
    <Suspense>
      <HomeClient initialFragrances={fragrances} initialTotal={total} />
    </Suspense>
  );
}
