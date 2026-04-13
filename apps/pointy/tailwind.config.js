/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'vn-black': '#080a0f',
        'vn-surface': '#0e1118',
        'vn-surface2': '#151921',
        'vn-surface3': '#1c232e',
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
        /* Pointy wizard–specific (aligned with prototype) */
        'vn-wizard-bg': '#090c12',
        'vn-wizard-text': '#c8d6e8',
        'vn-wizard-muted': '#3d4d62',
        'vn-wizard-fog': '#5a6d85',
        'vn-wizard-fog2': '#7a8fa8',
        'vn-pink': '#ff6eb4',
        'vn-teal': '#00d4aa',
        'vn-red': '#ff4d4d',
      },
      fontFamily: {
        sans: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        'flow-dash': {
          to: { strokeDashoffset: '-20' },
        },
        pls: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
      },
      animation: {
        'flow-dash': 'flow-dash 0.5s linear infinite',
        pls: 'pls 2s infinite',
      },
    },
  },
  plugins: [],
  /* Dynamic classes toggled from JS on SVG paths */
  safelist: ['stroke-dasharray-[8_4]', 'animate-flow-dash', 'port-is-connected'],
}
