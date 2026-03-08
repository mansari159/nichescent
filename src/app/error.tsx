'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-serif text-[100px] text-obsidian-100 font-light leading-none mb-4">500</p>
      <h1 className="font-serif text-4xl text-obsidian-900 font-light mb-3">Something went wrong.</h1>
      <p className="text-obsidian-500 text-lg mb-10 max-w-sm">
        An unexpected error occurred. Please try again — or get in touch if the problem persists.
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        <button
          onClick={reset}
          className="text-xs tracking-widest uppercase bg-obsidian-900 text-cream px-8 py-3.5 hover:bg-gold-600 transition-colors"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="text-xs tracking-widest uppercase border border-obsidian-300 text-obsidian-600 px-8 py-3.5 hover:border-obsidian-500 transition-colors"
        >
          Go Home
        </Link>
      </div>
      <p className="mt-8 text-xs text-obsidian-400">
        Error reference: {error.digest ?? 'unknown'}
      </p>
    </div>
  )
}
