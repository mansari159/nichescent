'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import FragranceCard, { type Fragrance } from './FragranceCard';
import ExpandedFragranceCard from './ExpandedFragranceCard';
import FilterPanel from './FilterPanel';
import SearchBar from './SearchBar';

interface DiscoverClientProps {
  initialFragrances: Fragrance[];
  initialTotal: number;
}

export default function DiscoverClient({ initialFragrances, initialTotal }: DiscoverClientProps) {
  const [fragrances, setFragrances] = useState<Fragrance[]>(initialFragrances);
  const [total, setTotal] = useState(initialTotal);
  const [expanded, setExpanded] = useState<Fragrance | null>(null);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(initialFragrances.length);
  const [showIntro, setShowIntro] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const params = useSearchParams();

  // ── Cinematic intro (once per session) ────────────────────────────────────
  useEffect(() => {
    if (!sessionStorage.getItem('discover_visited')) {
      setShowIntro(true);
      setTimeout(() => {
        setShowIntro(false);
        sessionStorage.setItem('discover_visited', '1');
      }, 2500);
    }
  }, []);

  // ── Fetch on filter change ─────────────────────────────────────────────────
  useEffect(() => {
    const q = Object.fromEntries(params.entries());
    setLoading(true);
    const qs = new URLSearchParams({ ...q, limit: '24', offset: '0' }).toString();
    fetch(`/api/fragrances?${qs}`)
      .then(r => r.json())
      .then(d => {
        setFragrances(d.fragrances ?? []);
        setTotal(d.total ?? 0);
        setOffset(d.fragrances?.length ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params]);

  // ── Infinite scroll ────────────────────────────────────────────────────────
  const loadMore = useCallback(() => {
    if (loading || fragrances.length >= total) return;
    const q = Object.fromEntries(params.entries());
    const qs = new URLSearchParams({ ...q, limit: '24', offset: String(offset) }).toString();
    fetch(`/api/fragrances?${qs}`)
      .then(r => r.json())
      .then(d => {
        setFragrances(prev => [...prev, ...(d.fragrances ?? [])]);
        setOffset(prev => prev + (d.fragrances?.length ?? 0));
      })
      .catch(() => {});
  }, [loading, fragrances.length, total, params, offset]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const obs = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMore(); },
      { threshold: 0.8 }
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [loadMore]);

  return (
    <>
      {/* Fixed cinematic background */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: "url('/assets/cinematic/raretrace-flag-marrakech.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.7)',
        }}
      />

      {/* Cinematic intro overlay */}
      {showIntro && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: '#0e0b08' }}
        >
          <p className="font-display text-4xl md:text-6xl font-light text-center px-8" style={{ color: '#ede0cc' }}>
            Discover the world<br /><em>through scent</em>
          </p>
        </div>
      )}

      {/* Sticky filter bar at top of viewport (below navbar) */}
      <div
        className="relative z-10 pt-16"
        style={{ backgroundColor: 'rgba(14,11,8,0.85)', backdropFilter: 'blur(8px)' }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <SearchBar variant="dark" className="mb-4" />
          <FilterPanel />
        </div>
      </div>

      {/* CSS masonry grid — results begin below filter bar */}
      <div
        className="relative z-10 px-6 py-6 max-w-7xl mx-auto"
        style={{
          columns: 'var(--cols, 4)',
          columnGap: '1px',
          // Responsive: 4 → 2 → 1 col
        }}
      >
        <style>{`
          @media (max-width: 1024px) { :root { --cols: 3 } }
          @media (max-width: 768px)  { :root { --cols: 2 } }
          @media (max-width: 480px)  { :root { --cols: 1 } }
          :root { --cols: 4 }
        `}</style>

        {fragrances.map((f, i) => (
          <div key={f.id} style={{ breakInside: 'avoid', marginBottom: '1px' }}>
            <FragranceCard
              fragrance={f}
              onExpand={setExpanded}
              priority={i < 4}
            />
          </div>
        ))}
      </div>

      {loading && (
        <div className="relative z-10 text-center py-8">
          <p className="font-mono text-[10px] tracking-widest uppercase" style={{ color: '#6a5a48' }}>Loading…</p>
        </div>
      )}

      {fragrances.length === 0 && !loading && (
        <div className="relative z-10 text-center py-24">
          <p className="font-mono text-[11px] tracking-widest uppercase" style={{ color: '#6a5a48' }}>
            No fragrances found — try adjusting the filters.
          </p>
        </div>
      )}

      <div ref={sentinelRef} className="relative z-10 h-20" />

      {/* Expanded card */}
      {expanded && (
        <ExpandedFragranceCard fragrance={expanded} onClose={() => setExpanded(null)} />
      )}
    </>
  );
}
