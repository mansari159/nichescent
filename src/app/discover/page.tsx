import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { serverClient } from '@/lib/supabase-server';
import type { Metadata } from 'next';
import DiscoverClient from '@/components/DiscoverClient';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Discover' };



export default async function DiscoverPage() {
  const sb = serverClient();
  if (!sb) notFound();
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
