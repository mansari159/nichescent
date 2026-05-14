'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

const HOUSE_TYPES = ['niche', 'indie', 'middle_eastern', 'designer', 'clone'];
const GENDERS     = ['masculine', 'feminine', 'unisex'];
const TIERS       = ['budget', 'mid', 'niche_tier', 'luxury'];
const SORT_OPTIONS = [
  { value: 'rank',   label: 'Rank' },
  { value: 'new',    label: 'Newest' },
  { value: 'rating', label: 'Rating' },
  { value: 'name',   label: 'A–Z' },
];

const LABEL: Record<string, string> = {
  niche: 'Niche', indie: 'Indie', middle_eastern: 'Middle Eastern',
  designer: 'Designer', clone: 'Clone',
  masculine: 'Masculine', feminine: 'Feminine', unisex: 'Unisex',
  budget: 'Under $30', mid: '$30–100', niche_tier: '$100–300', luxury: '$300+',
};

interface FilterPanelProps {
  className?: string;
}

export default function FilterPanel({ className = '' }: FilterPanelProps) {
  const router = useRouter();
  const params = useSearchParams();

  const update = useCallback((key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('offset'); // reset pagination
    // router.replace — no history entry per build-plan spec
    router.replace(`?${next.toString()}`, { scroll: false });
  }, [params, router]);

  const toggle = useCallback((key: string, value: string) => {
    const current = params.get(key);
    update(key, current === value ? null : value);
  }, [params, update]);

  const active = (key: string, value: string) => params.get(key) === value;

  const ChipRow = ({ label, items, paramKey }: { label: string; items: string[]; paramKey: string }) => (
    <div className="mb-3">
      <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-2" style={{ color: '#6a5a48' }}>{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map(item => (
          <button
            key={item}
            onClick={() => toggle(paramKey, item)}
            className="font-mono text-[9px] tracking-wide uppercase px-3 py-1.5 transition-all duration-150"
            style={{
              border: `1px solid ${active(paramKey, item) ? '#B8762A' : '#2a2018'}`,
              color: active(paramKey, item) ? '#B8762A' : '#6a5a48',
              backgroundColor: active(paramKey, item) ? 'rgba(184,118,42,0.08)' : 'transparent',
            }}
          >
            {LABEL[item] ?? item}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`${className}`}>
      <ChipRow label="House type" items={HOUSE_TYPES} paramKey="house_type" />
      <ChipRow label="Gender"     items={GENDERS}     paramKey="gender" />
      <ChipRow label="Price tier" items={TIERS}        paramKey="tier" />

      {/* Sort */}
      <div>
        <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-2" style={{ color: '#6a5a48' }}>Sort</p>
        <div className="flex flex-wrap gap-2">
          {SORT_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => toggle('sort', value)}
              className="font-mono text-[9px] tracking-wide uppercase px-3 py-1.5 transition-all duration-150"
              style={{
                border: `1px solid ${active('sort', value) ? '#B8762A' : '#2a2018'}`,
                color: active('sort', value) ? '#B8762A' : '#6a5a48',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
