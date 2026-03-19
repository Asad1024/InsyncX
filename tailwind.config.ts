import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['var(--font-sans)', 'Roboto', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Roboto', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg:       '#09090b',
        surface:  '#111113',
        surface2: '#18181b',
        surface3: '#27272a',
        gold:     '#d4a843',
        'gold-dim': '#a07830',
      },
      spacing: {
        'nav':     '64px',
        'sidebar': '240px',
        'account': '260px',
        'cart':    '420px',
      },
      borderRadius: {
        xs:   '4px',
        sm:   '6px',
        md:   '10px',
        lg:   '14px',
        xl:   '20px',
        '2xl':'28px',
      },
      fontSize: {
        'display': ['clamp(48px, 5vw, 72px)', { lineHeight: '1.0', letterSpacing: '-0.02em' }],
        'h1':  ['40px', { lineHeight: '1.1' }],
        'h2':  ['32px', { lineHeight: '1.15' }],
        'h3':  ['24px', { lineHeight: '1.2' }],
        'h4':  ['18px', { lineHeight: '1.3' }],
        'label': ['11px', { letterSpacing: '0.08em' }],
        'micro': ['10px', { letterSpacing: '0.10em' }],
      },
      maxWidth: {
        content: '1280px',
      },
      animation: {
        'fade-up':      'fadeUp 0.5s ease forwards',
        'fade-in':      'fadeIn 0.3s ease forwards',
        'marquee-left': 'marqueeLeft 25s linear infinite',
        'marquee-right':'marqueeRight 25s linear infinite',
        'pulse-slow':   'pulse 2s ease-in-out infinite',
        'scale-in':     'scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'shimmer':      'shimmer 1.4s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        marqueeLeft: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
        marqueeRight: {
          from: { transform: 'translateX(-50%)' },
          to:   { transform: 'translateX(0)' },
        },
        pulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%':      { opacity: '1' },
        },
        scaleIn: {
          from: { transform: 'scale(0)', opacity: '0' },
          to:   { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

export default config
