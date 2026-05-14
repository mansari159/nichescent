'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Fragrance } from './FragranceCard';

interface SearchBarProps {
  variant?: 'dark' | 'cream';
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ variant = 'dark', placeholder = 'Search fragrances, houses, notes…', className = '' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Fragrance[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);

  const isDark = variant === 'dark';
  const borderColor = isDark ? '#2a2018' : '#e0cdb5';
  const textColor   = isDark ? '#d4c4a8' : '#3a2e22';
  const bgColor     = isDark ? '#171210' : '#fdf7ef';
  const mutedColor  = isDark ? '#6a5a48' : '#8a7560';

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const search = (q: string) => {
    if (!q.trim()) { setResults([]); setOpen(false); return; }
    setLoading(true);
    fetch(`/api/fragrances?q=${encodeURIComponent(q)}&limit=6`)
      .then(r => r.json())
      .then(d => { setResults(d.fragrances ?? []); setOpen(true); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 300);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          value={query}
          onChange={onChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="w-full font-mono text-[11px] tracking-wide px-4 py-3 outline-none"
          style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}`, color: textColor }}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-3 h-3 border border-[#B8762A] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </form>

      {open && results.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 z-50 mt-0.5"
          style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}` }}
        >
          {results.map(f => (
            <Link
              key={f.id}
              href={`/fragrance/${f.slug}`}
              onClick={() => { setOpen(false); setQuery(''); }}
              className="flex items-center gap-3 px-4 py-3 transition-colors duration-150"
              style={{ borderBottom: `1px solid ${borderColor}` }}
            >
              <div className="flex-1 min-w-0">
                <p className="font-display text-sm truncate" style={{ color: textColor }}>{f.name}</p>
                <p className="font-mono text-[9px] tracking-widest uppercase" style={{ color: mutedColor }}>{f.house_name}</p>
              </div>
              {f.house_type === 'clone' && (
                <span className="font-mono text-[8px] tracking-widest uppercase px-2 py-0.5"
                  style={{ border: '1px solid #5a7a8a', color: '#5a7a8a' }}>
                  Clone
                </span>
              )}
            </Link>
          ))}
          <Link
            href={`/search?q=${encodeURIComponent(query)}`}
            onClick={() => setOpen(false)}
            className="block px-4 py-3 font-mono text-[9px] tracking-widest uppercase text-center transition-colors"
            style={{ color: '#B8762A' }}
          >
            See all results
          </Link>
        </div>
      )}
    </div>
  );
}
