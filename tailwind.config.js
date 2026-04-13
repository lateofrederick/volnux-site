/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'vn-black': '#080a0f',
        'vn-surface': '#0e1118',
        'vn-surface2': '#151921',
        'vn-border': '#1e2530',
        'vn-border2': '#2a3340',
        'vn-accent': '#00e5ff',
        'vn-accent2': '#7b61ff',
        'vn-accent3': '#00ff94',
        'vn-text': '#e8edf5',
        'vn-muted': '#6b7a90',
        'vn-muted2': '#4a5568',
        'vn-white': '#ffffff',
        'vn-string': '#fd79a8',
        'vn-retry': '#fdcb6e',
        'vn-attr': '#ff9f43',
      },
      fontFamily: {
        display: ['Syne', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.45' },
        },
        'scroll-line': {
          '0%': { transform: 'scaleY(0)', transformOrigin: 'top', opacity: '0' },
          '50%': { transform: 'scaleY(1)', transformOrigin: 'top', opacity: '1' },
          '100%': { transform: 'scaleY(1)', transformOrigin: 'bottom', opacity: '0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.65s ease forwards',
        'pulse-dot': 'pulse-dot 2s ease infinite',
        'scroll-line': 'scroll-line 2s ease infinite',
      },
    },
  },
  plugins: [],
}
