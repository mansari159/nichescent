'use client';

const TIER_CONFIG: Record<string, { label: string; color: string }> = {
  budget:   { label: 'Under $30',  color: '#5a8a5a' },
  mid:      { label: '$30–100',    color: '#7a6a3a' },
  niche_tier:{ label: '$100–300',  color: '#8a5a2a' },
  luxury:   { label: '$300+',      color: '#6a4a7a' },
  clone:    { label: 'Clone',      color: '#5a7a8a' },
  designer: { label: 'Designer',   color: '#666666' },
};

interface TierPillProps {
  tier: string;
  className?: string;
}

export default function TierPill({ tier, className = '' }: TierPillProps) {
  const cfg = TIER_CONFIG[tier] ?? { label: tier, color: '#8a7060' };
  return (
    <span
      className={`tier-pill ${className}`}
      style={{ color: cfg.color, borderLeft: `2px solid ${cfg.color}`, paddingLeft: '6px' }}
    >
      {cfg.label}
    </span>
  );
}
