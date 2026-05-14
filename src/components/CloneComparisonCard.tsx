'use client';
import Image from 'next/image';
import Link from 'next/link';
import TierPill from './TierPill';
import { getAffiliateUrl } from './FragranceCard';
import type { Fragrance } from './FragranceCard';

interface CloneComparisonCardProps {
  clone: Fragrance & { original?: Fragrance | null };
}

function BuyButton({ fragrance }: { fragrance: Fragrance }) {
  const url = getAffiliateUrl(fragrance.affiliate_links);
  if (!url) {
    return (
      <span className="font-mono text-[9px] tracking-widest uppercase" style={{ color: '#6a5a48' }}>
        Link coming soon
      </span>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="font-mono text-[10px] tracking-widest uppercase px-5 py-2.5 transition-colors duration-200"
      style={{ backgroundColor: '#B8762A', color: '#0e0b08' }}
    >
      Buy
    </a>
  );
}

function FragranceHalf({ fragrance, label }: { fragrance: Fragrance; label: string }) {
  const img = fragrance.image_url || fragrance.image_path || '/placeholder.jpg';
  return (
    <div className="flex flex-col" style={{ backgroundColor: '#fdf7ef' }}>
      <div className="relative w-full" style={{ aspectRatio: '1/1' }}>
        <Image
          src={img}
          alt={fragrance.name}
          fill
          className="object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }}
        />
        <div
          className="absolute top-2 left-2 font-mono text-[8px] tracking-widest uppercase px-2 py-1"
          style={{ backgroundColor: '#1e1610', color: '#d4c4a8' }}
        >
          {label}
        </div>
      </div>
      <div className="p-5">
        <TierPill tier={fragrance.tier} className="mb-2" />
        <Link href={`/fragrance/${fragrance.slug}`}>
          <h3 className="font-display text-xl leading-tight mb-1" style={{ color: '#1e1610' }}>
            {fragrance.name}
          </h3>
        </Link>
        <p className="font-mono text-[9px] tracking-widest uppercase mb-4" style={{ color: '#8a7560' }}>
          {fragrance.house_name}
        </p>
        {fragrance.base_notes?.length > 0 && (
          <p className="font-mono text-[9px] mb-4" style={{ color: '#8a7560' }}>
            {fragrance.base_notes.slice(0, 3).join(' · ')}
          </p>
        )}
        <BuyButton fragrance={fragrance} />
      </div>
    </div>
  );
}

export default function CloneComparisonCard({ clone }: CloneComparisonCardProps) {
  const original = clone.original;

  return (
    <div style={{ border: '1px solid #e0cdb5' }}>
      {/* VS header */}
      <div
        className="flex items-center justify-center gap-4 py-3 px-5"
        style={{ backgroundColor: '#e0cdb5' }}
      >
        <span className="font-mono text-[9px] tracking-widest uppercase" style={{ color: '#8a7560' }}>
          {original?.house_name ?? '—'}
        </span>
        <span className="font-mono text-xs font-medium" style={{ color: '#1e1610' }}>VS</span>
        <span className="font-mono text-[9px] tracking-widest uppercase" style={{ color: '#8a7560' }}>
          {clone.house_name}
        </span>
        {clone.similarity_score && (
          <span
            className="ml-auto font-mono text-[9px] tracking-widest uppercase px-2 py-1"
            style={{ backgroundColor: '#5a7a8a', color: '#fff' }}
          >
            {Math.round(clone.similarity_score * 100)}% match
          </span>
        )}
      </div>

      {/* Side-by-side */}
      <div className="grid grid-cols-2">
        {original
          ? <FragranceHalf fragrance={original} label="Original" />
          : <div className="p-8 flex items-center justify-center" style={{ color: '#8a7560' }}>
              <span className="font-mono text-xs">Original not found</span>
            </div>
        }
        <FragranceHalf fragrance={clone} label="Clone" />
      </div>
    </div>
  );
}
