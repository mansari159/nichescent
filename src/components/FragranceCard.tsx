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
  const imgSrc = fragrance.image_url || fragrance.image_path || '/placeholder.jpg';

  return (
    <motion.div
      layoutId={`card-${fragrance.id}`}
      className="relative overflow-hidden cursor-pointer group"
      style={{
        backgroundColor: '#171210',
        borderLeft: `2px solid var(--tier-${fragrance.tier === 'niche_tier' ? 'niche' : fragrance.tier}, #6a5a48)`,
        aspectRatio: '3/4',
      }}
      onClick={() => onExpand?.(fragrance)}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      {/* Image */}
      <motion.div layoutId={`card-image-${fragrance.id}`} className="absolute inset-0">
        <Image
          src={imgSrc}
          alt={fragrance.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={priority}
          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }}
        />
        {/* Dark overlay — shown on hover */}
        <div
          className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: 'linear-gradient(to top, rgba(14,11,8,0.95) 0%, rgba(14,11,8,0.4) 60%, transparent 100%)' }}
        >
          <TierPill tier={fragrance.tier} className="mb-2" />
          <p className="font-display text-lg leading-tight" style={{ color: '#ede0cc' }}>
            {fragrance.name}
          </p>
          {fragrance.house_name && (
            <p className="font-mono text-[9px] tracking-widest uppercase mt-1" style={{ color: '#6a5a48' }}>
              {fragrance.house_name}
            </p>
          )}
          {fragrance.top_notes?.length > 0 && (
            <p className="font-mono text-[9px] mt-2" style={{ color: '#6a5a48' }}>
              {fragrance.top_notes.slice(0, 3).join(' · ')}
            </p>
          )}
        </div>
      </motion.div>

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
  );
}
