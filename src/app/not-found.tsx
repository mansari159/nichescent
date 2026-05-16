import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-24 text-center"
      style={{ backgroundColor: '#141008' }}
    >
      <p
        className="font-display font-light leading-none mb-4"
        style={{ fontSize: '120px', color: '#3a2a1a' }}
      >
        404
      </p>
      <h1 className="font-display text-4xl font-light mb-3" style={{ color: '#f2e8d8' }}>
        Fragrance not found.
      </h1>
      <p className="font-body text-lg mb-10 max-w-sm" style={{ color: '#8a7060' }}>
        This page doesn&apos;t exist — but the fragrance you&apos;re looking for might.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        {[
          { href: '/',         label: 'Homepage' },
          { href: '/discover', label: 'Discover' },
          { href: '/houses',   label: 'Houses' },
          { href: '/search',   label: 'Search' },
        ].map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="font-mono text-[10px] tracking-widest uppercase px-5 py-2.5 transition-colors duration-200"
            style={{ border: '1px solid #3a2a1a', color: '#8a7060' }}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
