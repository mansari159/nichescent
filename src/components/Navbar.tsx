'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/discover',  label: 'Discover' },
  { href: '/houses',    label: 'Houses' },
  { href: '/origins',   label: 'Origins' },
  { href: '/clones',    label: 'Clones' },
  { href: '/search',    label: 'Search' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: scrolled ? 'rgba(14,11,8,0.97)' : '#0e0b08',
          borderBottom: `1px solid ${scrolled ? '#2a2018' : 'transparent'}`,
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="font-display text-lg tracking-[0.22em] uppercase transition-colors duration-200"
            style={{ color: '#ede0cc' }}
          >
            RARETRACE
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  className="font-mono text-[10px] tracking-widest uppercase transition-colors duration-200"
                  style={{ color: active ? '#B8762A' : '#6a5a48' }}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Menu"
          >
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="block w-5 h-px transition-all duration-300"
                style={{
                  backgroundColor: '#d4c4a8',
                  transform: menuOpen
                    ? i === 0 ? 'rotate(45deg) translate(3px, 3px)'
                      : i === 1 ? 'scaleX(0)'
                      : 'rotate(-45deg) translate(3px, -3px)'
                    : 'none',
                }}
              />
            ))}
          </button>
        </div>
      </nav>

      {/* Mobile full-screen overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-2"
          style={{ backgroundColor: '#0e0b08' }}
        >
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="font-display text-3xl py-4 transition-colors duration-200"
              style={{ color: pathname === href ? '#B8762A' : '#ede0cc' }}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}