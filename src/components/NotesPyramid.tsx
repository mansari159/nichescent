'use client';
import { useEffect, useRef } from 'react';

interface NotesPyramidProps {
  top: string[];
  heart: string[];
  base: string[];
}

export default function NotesPyramid({ top, heart, base }: NotesPyramidProps) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const paths = ref.current.querySelectorAll<SVGPathElement>('[data-draw]');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            paths.forEach((p, i) => {
              const len = p.getTotalLength();
              p.style.strokeDasharray = String(len);
              p.style.strokeDashoffset = String(len);
              p.style.transition = `stroke-dashoffset 0.9s ease ${i * 0.25}s`;
              requestAnimationFrame(() => { p.style.strokeDashoffset = '0'; });
            });
            obs.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const Tier = ({ notes, label, width }: { notes: string[]; label: string; width: string }) => (
    <div className="mb-8 last:mb-0">
      <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3" style={{ color: '#8a7060' }}>
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {notes.map(n => (
          <span
            key={n}
            className="font-mono text-[10px] tracking-wide px-3 py-1.5"
            style={{ backgroundColor: '#1e1812', color: '#e0d0b8', border: '1px solid #3a2a1a' }}
          >
            {n}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      {/* SVG pyramid */}
      <svg
        ref={ref}
        viewBox="0 0 300 160"
        className="w-full max-w-xs mx-auto mb-8 block"
        style={{ color: '#3a2a1a' }}
      >
        {/* Base triangle */}
        <path
          d="M150 10 L290 145 L10 145 Z"
          fill="none"
          stroke="#3a2a1a"
          strokeWidth="1"
          data-draw
        />
        {/* Divider lines */}
        <path d="M90 85 L210 85" fill="none" stroke="#3a2a1a" strokeWidth="0.8" data-draw />
        <path d="M55 120 L245 120" fill="none" stroke="#3a2a1a" strokeWidth="0.8" data-draw />
        {/* Labels */}
        <text x="150" y="52" textAnchor="middle" style={{ font: '7px DM Mono, monospace', fill: '#8a7060', letterSpacing: '0.15em', textTransform: 'uppercase' }}>TOP</text>
        <text x="150" y="102" textAnchor="middle" style={{ font: '7px DM Mono, monospace', fill: '#8a7060', letterSpacing: '0.15em', textTransform: 'uppercase' }}>HEART</text>
        <text x="150" y="137" textAnchor="middle" style={{ font: '7px DM Mono, monospace', fill: '#8a7060', letterSpacing: '0.15em', textTransform: 'uppercase' }}>BASE</text>
      </svg>

      {/* Note lists */}
      {top?.length   > 0 && <Tier notes={top}   label="Top notes"   width="60" />}
      {heart?.length > 0 && <Tier notes={heart} label="Heart notes" width="75" />}
      {base?.length  > 0 && <Tier notes={base}  label="Base notes"  width="90" />}
    </div>
  );
}
