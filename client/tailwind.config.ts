import type { Config } from 'tailwindcss';

/**
 * Charte graphique B.A. Construction
 * Palette dérivée de la carte de visite : bleu marine, crème, olive, terracotta.
 */
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#eef2f6',
          100: '#d8e0e8',
          200: '#b3c2d1',
          300: '#8ba0b6',
          400: '#5e7a94',
          500: '#3a5670',
          600: '#2a4359',
          700: '#1a3751',
          800: '#142a3e',
          900: '#0e1f2e',
          950: '#08131d',
        },
        clay: {
          50: '#fef3ee',
          100: '#fde3d6',
          200: '#fac2a8',
          300: '#f59a71',
          400: '#f07a45',
          500: '#e76836',
          600: '#c9541f',
          700: '#a6421a',
          800: '#853719',
          900: '#6b3018',
        },
        olive: {
          50: '#f5f7ef',
          100: '#e8edda',
          200: '#d2dcb8',
          300: '#b3c489',
          400: '#93a95f',
          500: '#788e3e',
          600: '#5d702e',
          700: '#4a5826',
          800: '#3d4822',
          900: '#333c1f',
        },
        sky: {
          50: '#f0f8fd',
          100: '#dceffc',
          200: '#b8ddf7',
          300: '#8ecbf1',
          400: '#76c3e9',
          500: '#4aa9d8',
          600: '#3588bb',
          700: '#2c6d98',
          800: '#285a7d',
          900: '#264c69',
        },
        cream: {
          50: '#fdfcf7',
          100: '#f9f6e7',
          200: '#f2ecd5',
          300: '#e9e0bf',
          400: '#ddcfa3',
          500: '#cbb884',
        },
        ink: {
          400: '#9c9e9d',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#262b30',
          900: '#171a1d',
        },
      },
      fontFamily: {
        display: ['Manrope Variable', 'Manrope', 'system-ui', 'sans-serif'],
        sans: ['Inter Variable', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      spacing: {
        13: '3.25rem',
        18: '4.5rem',
      },
      letterSpacing: {
        widest2: '0.18em',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(23,26,29,0.04), 0 8px 24px -8px rgba(23,26,29,0.10)',
        lift: '0 2px 4px rgba(23,26,29,0.05), 0 20px 48px -16px rgba(23,26,29,0.22)',
        nav: '0 1px 0 rgba(23,26,29,0.06), 0 8px 32px -16px rgba(23,26,26,0.14)',
      },
      backgroundImage: {
        'grid-fine':
          'linear-gradient(to right, rgba(26,55,81,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(26,55,81,0.05) 1px, transparent 1px)',
        'grain':
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
      },
      backgroundSize: {
        grid: '48px 48px',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both',
        marquee: 'marquee 40s linear infinite',
        shimmer: 'shimmer 1.8s linear infinite',
      },
      transitionTimingFunction: {
        fluid: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
