import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand:            'hsl(var(--brand) / <alpha-value>)',
        'brand-hover':    'hsl(var(--brand-hover) / <alpha-value>)',
        'bg-base':        'hsl(var(--bg-base) / <alpha-value>)',
        'bg-card':        'hsl(var(--bg-card) / <alpha-value>)',
        'bg-hover':       'hsl(var(--bg-hover) / <alpha-value>)',
        'text-primary':   'hsl(var(--text-primary) / <alpha-value>)',
        'text-secondary': 'hsl(var(--text-secondary) / <alpha-value>)',
        'text-muted':     'hsl(var(--text-muted) / <alpha-value>)',
        border:           'hsl(var(--border) / <alpha-value>)',
        success:          'hsl(var(--success) / <alpha-value>)',
        warning:          'hsl(var(--warning) / <alpha-value>)',
        danger:           'hsl(var(--danger) / <alpha-value>)',
      },
      boxShadow: {
        card:     '0 1px 3px hsl(0 0% 0% / 0.4)',
        elevated: '0 4px 12px hsl(0 0% 0% / 0.5)',
      },
      borderRadius: {
        xl:  '0.75rem',
        '2xl': '1rem',
      },
      fontFamily: {
        sans: ['DM Sans', 'Segoe UI', 'sans-serif'],
        mono: ['monospace'],
      },
    },
  },
  plugins: [],
}

export default config
