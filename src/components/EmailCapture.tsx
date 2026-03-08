'use client'

import { useState } from 'react'

interface Props {
  source?: string
  placeholder?: string
  buttonText?: string
  className?: string
}

export default function EmailCapture({
  source = 'unknown',
  placeholder = 'your@email.com',
  buttonText = 'Notify Me',
  className = '',
}: Props) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || status === 'loading') return

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRe.test(email)) {
      setErrorMsg('Please enter a valid email address.')
      setStatus('error')
      return
    }

    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source }),
      })
      const data = await res.json()
      if (data.success) {
        setStatus('success')
        setEmail('')
      } else {
        setStatus('error')
        setErrorMsg(data.error ?? 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Connection error. Please try again.')
    }
  }

  if (status === 'success') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm text-obsidian-600">
          We&apos;ll notify you when new fragrances arrive.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={`w-full max-w-sm mx-auto ${className}`}>
      <div className="flex gap-0">
        <input
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setStatus('idle'); setErrorMsg('') }}
          placeholder={placeholder}
          disabled={status === 'loading'}
          className="flex-1 px-4 py-3 bg-white border border-obsidian-200 text-sm text-obsidian-900 placeholder:text-obsidian-300 focus:outline-none focus:border-gold-400 disabled:opacity-60 transition-colors"
          aria-label="Email address"
          required
        />
        <button
          type="submit"
          disabled={status === 'loading' || !email.trim()}
          className="px-5 py-3 bg-obsidian-900 text-cream text-xs tracking-widest uppercase hover:bg-gold-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0"
        >
          {status === 'loading' ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border border-cream border-t-transparent rounded-full animate-spin" />
              Saving…
            </span>
          ) : buttonText}
        </button>
      </div>
      {errorMsg && (
        <p className="mt-2 text-xs text-red-500">{errorMsg}</p>
      )}
    </form>
  )
}
