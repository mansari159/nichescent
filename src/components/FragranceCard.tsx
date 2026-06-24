'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import TierPill from './TierPill';

export interface Fragrance {
  id: string;
  name: string;
  slug: string;
  house_name: string | null;
  house_type: string;
  tier: string;
  gender: string;
  top_notes: string[];
  heart_notes: string[];
  base_notes: string[];
  community_rating: number | null;
  image_url: string | null;
  image_path: string | null;
  rank_score: number;
  clone_of: string | null;
  plain_description: string | null;
  mood_tags: string[];
  affiliate_links: Record<string, string> | null;
  similarity_score?: number | null;
  house_id?: string | null;
}

interface FragranceCardProps {
  fragrance: Fragrance;
  onExpand?: (fragrance: Fragrance) => void;
  priority?: boolean;
}

export function getAffiliateUrl(links: Record<string, string> | null): string | null {
  if (!links) return null;
  const vals = Object.values(links).filter(Boolean);
  return vals.length > 0 ? vals[0] : null;
}

export default function FragranceCard({ fragrance, onExpand, priority = false }: FragranceCardProps) {
  const hasRealImage = !!(fragrance.image_url || fragrance.image_path);
  const imgSrc = fragrance.image_url || fragrance.image_path || '/placeholder.jpg';

  return (
    <motion.div
      layoutId={`card-${fragrance.id}`}
      className="flex flex-col overflow-hidden cursor-pointer group"
      style={{
        backgroundColor: 'var(--dark-surface)',
        borderLeft: `2px solid var(--tier-${fragrance.tier === 'niche_tier' ? 'niche' : fragrance.tier}, var(--dark-muted))`,
      }}
      onClick={() => onExpand?.(fragrance)}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      {/* Image area */}
      <motion.div layoutId={`card-image-${fragrance.id}`} className="relative h-48 flex-shrink-0">
        {hasRealImage ? (
          <Image
            src={imgSrc}
            alt={fragrance.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }}
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: 'var(--dark-bg)' }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: 'var(--amber)' }}
            />
          </div>
        )}

        {/* Hover overlay on image only */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ backgroundColor: 'rgba(14,11,8,0.25)' }}
        />

        {/* Clone badge */}
        {fragrance.house_type === 'clone' && (
          <div
            className="absolute top-2 right-2 font-mono text-[8px] tracking-widest uppercase px-2 py-1"
            style={{ backgroundColor: '#5a7a8a', color: '#fff' }}
          >
            Clone
          </div>
        )}
      </motion.div>

      {/* Text block — always visible */}
      <div className="p-3 flex flex-col gap-1" style={{ backgroundColor: 'var(--dark-surface)' }}>
        <p
          className="font-display text-sm leading-tight"
          style={{ color: 'var(--dark-heading)' }}
        >
          {fragrance.name}
        </p>
        {fragrance.house_name && (
          <p
            className="font-mono text-[9px] tracking-widest uppercase"
            style={{ color: 'var(--dark-muted)' }}
          >
            {fragrance.house_name}
          </p>
        )}
        <TierPill tier={fragrance.tier} className="mt-1 self-start" />
        {fragrance.top_notes?.length > 0 && (
          <p
            className="font-mono text-[9px] mt-1"
            style={{ color: 'var(--dark-muted)' }}
          >
            {fragrance.top_notes.slice(0, 3).join(' · ')}
          </p>
        )}
      </div>
    </motion.div>
  );
}
