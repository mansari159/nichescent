'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TierPill from './TierPill';
import NotesPyramid from './NotesPyramid';
import { getAffiliateUrl } from './FragranceCard';
import type { Fragrance } from './FragranceCard';

interface ExpandedFragranceCardProps {
  fragrance: Fragrance;
  onClose: () => void;
}

export default function ExpandedFragranceCard({ fragrance, onClose }: ExpandedFragranceCardProps) {
  // SSR guard — never call createPortal during server render
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const affiliateUrl = getAffiliateUrl(fragrance.affiliate_links);

  useEffect(() => {
    setMounted(true);
    router.replace(`/fragrance/${fragrance.slug}`);
    // Escape key listener
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClose() {
    router.replace('/discover');
    // Delay actual unmount so FLIP animation can play
    setTimeout(onClose, 400);
  }

  const img = fragrance.image_url || fragrance.image_path || '/placeholder.jpg';

  const modal = (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100]"
        style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
        onClick={handleClose}
      />
      <motion.div
        key="card"
        layoutId={`card-${fragrance.id}`}
        className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 z-[101] w-full md:w-[680px] md:-translate-x-1/2 md:-translate-y-1/2 overflow-y-auto"
        style={{ maxHeight: '90vh', backgroundColor: '#f5ede0' }}
      >
        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 font-mono text-[10px] tracking-widest uppercase p-2 transition-colors"
          style={{ color: '#8a7560' }}
        >
          ✕ Close
        </button>

        {/* Top 40%: image */}
        <motion.div layoutId={`card-image-${fragrance.id}`} className="relative w-full" style={{ height: '40%', minHeight: '220px' }}>
          <Image
            src={img}
            alt={fragrance.name}
            fill
            className="object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }}
          />
        </motion.div>

        {/* Bottom 60%: content */}
        <div className="p-8">
          <TierPill tier={fragrance.tier} className="mb-3" />
          <h2 className="font-display text-3xl leading-tight mb-1" style={{ color: '#1e1610' }}>
            {fragrance.name}
          </h2>
          {fragrance.house_name && (
            <Link href={`/house/${fragrance.slug}`}>
              <p className="font-mono text-[10px] tracking-widest uppercase mb-6 transition-colors hover:text-[#B8762A]" style={{ color: '#8a7560' }}>
                {fragrance.house_name}
              </p>
            </Link>
          )}

          {fragrance.plain_description && (
            <p className="font-body text-base leading-relaxed mb-6" style={{ color: '#3a2e22' }}>
              {fragrance.plain_description}
            </p>
          )}

          {/* Tags */}
          {fragrance.mood_tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {fragrance.mood_tags.map(t => (
                <span key={t} className="font-mono text-[9px] tracking-widest uppercase px-2 py-1"
                  style={{ border: '1px solid #e0cdb5', color: '#8a7560' }}>
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Notes pyramid */}
          {(fragrance.top_notes?.length > 0 || fragrance.heart_notes?.length > 0 || fragrance.base_notes?.length > 0) && (
            <div className="mb-8">
              <NotesPyramid top={fragrance.top_notes ?? []} heart={fragrance.heart_notes ?? []} base={fragrance.base_notes ?? []} />
            </div>
          )}

          {/* Affiliate CTA — conditional */}
          {affiliateUrl ? (
            <a
              href={affiliateUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="block w-full text-center font-mono text-[11px] tracking-widest uppercase py-4 transition-colors"
              style={{ backgroundColor: '#B8762A', color: '#0e0b08' }}
            >
              Buy Now
            </a>
          ) : (
            <p className="font-mono text-[10px] tracking-widest uppercase text-center py-4" style={{ color: '#8a7560' }}>
              Link coming soon
            </p>
          )}

          {/* Full page link */}
          <div className="text-center mt-4">
            <Link
              href={`/fragrance/${fragrance.slug}`}
              className="font-mono text-[10px] tracking-widest uppercase transition-colors"
              style={{ color: '#8a7560' }}
            >
              Full page →
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(modal, document.body);
}
