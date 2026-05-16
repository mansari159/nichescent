'use client';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-24 text-center"
      style={{ backgroundColor: '#141008' }}
    >
      <p
        className="font-display font-light leading-none mb-4"
        style={{ fontSize: '120px', color: '#3a2a1a' }}
      >
        500
      </p>
      <h1 className="font-display text-4xl font-light mb-3" style={{ color: '#f2e8d8' }}>
        Something went wrong.
      </h1>
      <p className="font-body text-lg mb-10 max-w-sm" style={{ color: '#8a7060' }}>
        An unexpected error occurred. Please try again or get in touch if the problem persists.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={reset}
          className="font-mono text-[10px] tracking-widest uppercase px-5 py-2.5 transition-colors duration-200"
          style={{ border: '1px solid #B8762A', color: '#B8762A' }}
        >
          Try again
        </button>
        <Link
          href="/"
          className="font-mono text-[10px] tracking-widest uppercase px-5 py-2.5 transition-colors duration-200"
          style={{ border: '1px solid #3a2a1a', color: '#8a7060' }}
        >
          Go home
        </Link>
      </div>
      {error.digest && (
        <p className="font-mono text-[9px] mt-8" style={{ color: '#3a2e22' }}>
          Error reference: {error.digest}
        </p>
      )}
    </div>
  );
}
