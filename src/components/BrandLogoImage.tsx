'use client'

/**
 * BrandLogoImage
 * Client component so onError (event handler) is valid in RSC pages.
 * Shows the logo image; falls back to a letter initial if it fails to load.
 */

import { useState } from 'react'

interface Props {
  src: string
  name: string
  /** pixel dimensions for the img element */
  size?: number
  className?: string
}

export default function BrandLogoImage({ src, name, size = 40, className = '' }: Props) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <span
        className="font-serif text-obsidian-400"
        style={{ fontSize: Math.round(size * 0.5) }}
      >
        {name.charAt(0)}
      </span>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
      onError={() => setFailed(true)}
    />
  )
}
