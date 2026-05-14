import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg:      '#0e0b08',
          surface: '#171210',
          border:  '#2a2018',
          text:    '#d4c4a8',
          muted:   '#6a5a48',
          heading: '#ede0cc',
        },
        cream: {
          DEFAULT: '#f5ede0',
          surface: '#fdf7ef',
          border:  '#e0cdb5',
          text:    '#3a2e22',
          muted:   '#8a7560',
          heading: '#1e1610',
        },
        amber: {
          DEFAULT: '#B8762A',
          hover:   '#9a611f',
          light:   '#f0d4a0',
        },
        tier: {
          budget:   '#5a8a5a',
          mid:      '#7a6a3a',
          niche:    '#8a5a2a',
          luxury:   '#6a4a7a',
          clone:    '#5a7a8a',
          designer: '#666666',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        mono:    ['var(--font-mono)', 'monospace'],
        body:    ['var(--font-body)', 'sans-serif'],
        serif:   ['var(--font-display)', 'Georgia', 'serif'],
        sans:    ['var(--font-body)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
