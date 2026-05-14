import { Suspense } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';
import DiscoverClient from '@/components/DiscoverClient';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Discover' };

function serverClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export default async function DiscoverPage() {
  const sb = serverClient();
  const { data, count } = await sb
    .from('fragrances')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .order('rank_score', { ascending: false })
    .range(0, 23);

  return (
    <Suspense>
      <DiscoverClient
        initialFragrances={data ?? []}
        initialTotal={count ?? 0}
      />
    </Suspense>
  );
}
