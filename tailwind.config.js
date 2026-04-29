/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Deep dark theme
        'vn-black': '#0a0a0f',
        'vn-surface': '#0c0c10',
        'vn-surface2': '#12121a',
        'vn-surface3': '#1a1a24',

        // Border
        'vn-border': '#1e1e2a',
        'vn-border2': '#2a2a3a',
        'vn-border3': '#3a3a4a',

        // Primary accent (indigo/violet)
        'vn-accent': '#6366f1',
        'vn-accent2': '#8b5cf6',
        'vn-accent3': '#a855f7',

        // Text
        'vn-text': '#f8fafc',
        'vn-text2': '#e2e8f0',
        'vn-muted': '#94a3b8',
        'vn-muted2': '#64748b',
        'vn-white': '#ffffff',

        // Status colors
        'vn-success': '#10b981',
        'vn-warning': '#f59e0b',
        'vn-error': '#ef4444',
      },

      animation: {
        'fade-up': 'fade-up 0.6s ease-out forwards',
        'fade-in': 'fade-in 0.4s ease-out forwards',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },

      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },

      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      fontFamily: {
        display: ['Syne', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // Unified type scale
        '2xs': ['0.625rem', { lineHeight: '1.4', letterSpacing: '0.05em' }],   // 10px
        'xs': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.02em' }],      // 12px
        'sm': ['0.875rem', { lineHeight: '1.6', letterSpacing: '0.01em' }],     // 14px
        'base': ['1rem', { lineHeight: '1.7', letterSpacing: '0' }],           // 16px
        'lg': ['1.125rem', { lineHeight: '1.7', letterSpacing: '-0.01em' }],   // 18px
        'xl': ['1.25rem', { lineHeight: '1.5', letterSpacing: '-0.02em' }],    // 20px
        '2xl': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.02em' }],     // 24px
        '3xl': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.03em' }],   // 30px
        '4xl': ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.03em' }],   // 36px
        '5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.04em' }],      // 48px
        '6xl': ['3.75rem', { lineHeight: '1.05', letterSpacing: '-0.04em' }],   // 60px
        '7xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.05em' }],      // 72px
      },
      spacing: {
        // 8px base grid system
        '18': '4.5rem',   // 72px
        '22': '5.5rem',   // 88px
        '26': '6.5rem',   // 104px
        '30': '7.5rem',   // 120px
      },
      maxWidth: {
        'prose': '65ch',
        'container': '1200px',
        'container-narrow': '900px',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        'scroll-line': {
          '0%': { transform: 'scaleY(0)', transformOrigin: 'top', opacity: '0' },
          '50%': { transform: 'scaleY(1)', transformOrigin: 'top', opacity: '1' },
          '100%': { transform: 'scaleY(1)', transformOrigin: 'bottom', opacity: '0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out forwards',
        'fade-in': 'fade-in 0.4s ease-out forwards',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
        'scroll-line': 'scroll-line 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [],
}
