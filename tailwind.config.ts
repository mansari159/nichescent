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
        obsidian: {
          50:  '#F7F5F2',
          100: '#EDE9E3',
          200: '#D8D0C5',
          300: '#BFB3A3',
          400: '#9E8E7A',
          500: '#7D6E5A',
          600: '#5E5143',
          700: '#3D352B',
          800: '#201C16',
          900: '#120F0B',
          950: '#0A0806',
        },
        gold: {
          100: '#F9EDD4',
          200: '#F0D49A',
          300: '#E3B85E',
          400: '#CFA042',
          500: '#B8882A',
          600: '#9A6E1C',
          700: '#755212',
        },
        cream: '#FAF8F4',
        parchment: '#F3EDE3',
        stone: '#8A8070',
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans:  ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.18em',
        widest3: '0.28em',
      },
    },
  },
  plugins: [],
}

export default config
