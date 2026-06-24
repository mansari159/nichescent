'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import FragranceCard, { type Fragrance } from './FragranceCard';
import ExpandedFragranceCard from './ExpandedFragranceCard';
import FilterPanel from './FilterPanel';
import SearchBar from './SearchBar';

interface HomeClientProps {
  initialFragrances: Fragrance[];
  initialTotal: number;
}

export default function HomeClient({ initialFragrances, initialTotal }: HomeClientProps) {
  const [fragrances, setFragrances] = useState<Fragrance[]>(initialFragrances);
  const [total, setTotal] = useState(initialTotal);
  const [expanded, setExpanded] = useState<Fragrance | null>(null);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(initialFragrances.length);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const params = useSearchParams();
  const router = useRouter();

  // ── Canvas particle system ─────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    interface Particle { x: number; y: number; vy: number; vx: number; size: number; alpha: number; }
    const particles: Particle[] = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vy: -(0.2 + Math.random() * 0.4),
      vx: (Math.random() - 0.5) * 0.2,
      size: 1 + Math.random() * 2,
      alpha: 0.05 + Math.random() * 0.15,
    }));

    let mx = canvas.width / 2, my = canvas.height / 2;
    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    window.addEventListener('mousemove', onMove);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        const dx = mx - p.x, dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) { p.vx += dx * 0.00005; p.vy += dy * 0.00005; }
        p.x += p.vx; p.y += p.vy;
        if (p.y < -5) { p.y = canvas.height + 5; p.x = Math.random() * canvas.width; }
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(184,118,42,${p.alpha})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  // ── Fetch on filter change ────────────────────────────────────────────────
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
      {/* Hero */}
      <section
        id="hero-canvas"
        className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-16"
        style={{ backgroundColor: 'var(--dark-bg)' }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
        <div className="relative z-10 text-center max-w-2xl mx-auto w-full">
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase mb-6" style={{ color: 'var(--amber)' }}>
            Niche Fragrance Discovery
          </p>
          <h1 className="font-display text-3xl sm:text-5xl md:text-7xl font-light leading-[1.05] mb-8" style={{ color: 'var(--dark-heading)' }}>
            What does your<br />
            <em>mood</em> smell like?
          </h1>
          <SearchBar variant="dark" className="max-w-lg mx-auto mb-6" />
          <FilterPanel className="max-w-2xl mx-auto" />
        </div>
      </section>

      {/* Results grid */}
      <section className="px-4 sm:px-6 py-12" style={{ backgroundColor: 'var(--dark-bg)' }}>
        {loading && (
          <p className="font-mono text-[10px] tracking-widest uppercase text-center mb-8" style={{ color: 'var(--dark-muted)' }}>
            Loading…
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px max-w-7xl mx-auto">
          {fragrances.map((f, i) => (
            <FragranceCard
              key={f.id}
              fragrance={f}
              onExpand={setExpanded}
              priority={i < 4}
            />
          ))}
        </div>
        {fragrances.length === 0 && !loading && (
          <p className="font-mono text-[11px] tracking-widest uppercase text-center py-24" style={{ color: 'var(--dark-muted)' }}>
            No fragrances found — try adjusting the filters.
          </p>
        )}
        <div ref={sentinelRef} className="h-20" />
      </section>

      {/* Expanded card */}
      {expanded && (
        <ExpandedFragranceCard fragrance={expanded} onClose={() => setExpanded(null)} />
      )}
    </>
  );
}
