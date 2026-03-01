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
        navy: {
          50:  '#f0f4f8',
          100: '#d9e2ec',
          500: '#2d4a6b',
          700: '#1a2f45',
          900: '#1A2332',
        },
        gold: {
          300: '#e8d5a3',
          400: '#d4b96a',
          500: '#C9A84C',
          600: '#a8872e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
