import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          page:  '#FFF8F0',
          card:  '#FFFFFF',
          hover: '#FFF3E8',
          input: '#FFFFFF',
          base:  '#FFF8F0',
        },
        border: {
          DEFAULT: '#F0E6D3',
          focus:   '#C2410C',
          light:   '#F0E6D3',
        },
        text: {
          primary:   '#1C0A00',
          secondary: '#78350F',
          muted:     '#92400E',
          faint:     '#C4884A',
        },
        brand: {
          DEFAULT: '#C2410C',
          dark:    '#7C2D12',
          hover:   '#9A3412',
          light:   '#FED7AA',
        },
        accent: {
          DEFAULT: '#D97706',
        },
        success: {
          DEFAULT: '#15803D',
          light:   '#86efac',
          bg:      'rgba(21,128,61,0.07)',
        },
        danger: {
          DEFAULT: '#DC2626',
          light:   '#fca5a5',
        },
        warning: {
          DEFAULT: '#D97706',
          light:   '#fbbf24',
        },
        info: {
          DEFAULT: '#3b82f6',
          light:   '#60a5fa',
        },
      },
      boxShadow: {
        card:     '0 1px 4px rgba(120,53,15,0.10)',
        elevated: '0 4px 16px rgba(120,53,15,0.15)',
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
