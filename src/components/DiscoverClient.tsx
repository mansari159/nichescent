'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
      {/* Fixed cinematic background — always present */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: "url('/assets/cinematic/raretrace-flag-marrakech.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Dark scrim over background when grid is visible */}
      <AnimatePresence>
        {!showIntro && (
          <motion.div
            className="fixed inset-0 z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            style={{ backgroundColor: 'rgba(14,11,8,0.75)' }}
          />
        )}
      </AnimatePresence>

      {/* Cinematic intro: pure full-screen image, no text, no UI */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="fixed inset-0 z-50"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>

      {/* Main content — slides up after intro */}
      <AnimatePresence>
        {!showIntro && (
          <motion.div
            className="relative z-10"
            initial={{ y: '100vh', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Sticky filter bar */}
            <div
              style={{ backgroundColor: 'rgba(14,11,8,0.85)', backdropFilter: 'blur(8px)' }}
              className="pt-16"
            >
              <div className="max-w-7xl mx-auto px-6 py-4">
                <SearchBar variant="dark" className="mb-4" />
                <FilterPanel />
              </div>
            </div>

            {/* CSS masonry grid */}
            <div
              className="px-6 py-6 max-w-7xl mx-auto"
              style={{
                columns: 'var(--cols, 4)',
                columnGap: '1px',
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
              <div className="text-center py-8">
                <p className="font-mono text-[10px] tracking-widest uppercase" style={{ color: '#8a7060' }}>Loading…</p>
              </div>
            )}

            {fragrances.length === 0 && !loading && (
              <div className="text-center py-24">
                <p className="font-mono text-[11px] tracking-widest uppercase" style={{ color: '#8a7060' }}>
                  No fragrances found — try adjusting the filters.
                </p>
              </div>
            )}

            <div ref={sentinelRef} className="h-20" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded card */}
      {expanded && (
        <ExpandedFragranceCard fragrance={expanded} onClose={() => setExpanded(null)} />
      )}
    </>
  );
}
