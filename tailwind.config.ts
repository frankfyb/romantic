/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        rose: {
          400: '#f472b6',
          500: '#ec4899',
        },
        pink: {
          50: '#fdf2f8',
          100: '#fef7fb',
        },
        yellow: {
          50: '#fefce8',
          100: '#fef9c3',
          400: '#facc15',
          600: '#ca8a04',
        },
        purple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          400: '#a855f7',
          500: '#9333ea',
          600: '#7e22ce',
        },
        red: {
          400: '#f87171',
          500: '#ef4444',
        },
        blue: {
          50: '#eff6ff',
          500: '#3b82f6',
        },
        green: {
          50: '#ecfdf5',
          500: '#22c55e',
          600: '#16a34a',
        },
        orange: {
          100: '#fff7ed',
          400: '#f97316',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
        },
        slate: {
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
        },
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'zoom-in': 'zoomIn 0.3s ease-in-out',
        'slide-in-from-bottom-4': 'slideInFromBottom 0.5s ease-in-out',
        'slide-in-from-right-4': 'slideInFromRight 0.5s ease-in-out',
        'slide-in-from-top-10': 'slideInFromTop 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        zoomIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideInFromBottom: {
          '0%': { transform: 'translateY(1rem)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInFromRight: {
          '0%': { transform: 'translateX(1rem)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInFromTop: {
          '0%': { transform: 'translateY(-2.5rem)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};