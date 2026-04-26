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
          base:  '#0f1117',
          card:  '#16181f',
          hover: '#1a1d25',
          input: '#0f1117',
        },
        border: {
          DEFAULT: '#2a2d3a',
          focus:   '#f4a261',
          light:   '#3a3f55',
        },
        text: {
          primary:   '#ffffff',
          secondary: '#e0e0e0',
          muted:     '#aaaaaa',
          faint:     '#555555',
        },
        brand: {
          DEFAULT: '#f4a261',
          dark:    '#e76f51',
        },
        success: {
          DEFAULT: '#16a34a',
          light:   '#86efac',
          bg:      'rgba(22,163,74,0.07)',
        },
        danger: {
          DEFAULT: '#ef4444',
          light:   '#fca5a5',
        },
        warning: {
          DEFAULT: '#f59e0b',
          light:   '#fbbf24',
        },
        info: {
          DEFAULT: '#3b82f6',
          light:   '#60a5fa',
        },
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
