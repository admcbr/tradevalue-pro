import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#08080C',
        bg2: '#0F0F17',
        card: '#12121A',
        card2: '#1A1A26',
        card3: '#20202E',
        border: '#252535',
        border2: '#2E2E45',
        accent: '#5B8FF0',
        accent2: '#7B6FF0',
        success: '#34D399',
        danger: '#F87171',
        warning: '#FBBF24',
        muted: '#8888AA',
        muted2: '#55556A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        '2xl': '18px',
        xl: '14px',
        lg: '11px',
        md: '8px',
        sm: '6px',
      },
      boxShadow: {
        glow: '0 0 30px rgba(91,143,240,0.08)',
        'glow-sm': '0 0 15px rgba(91,143,240,0.06)',
        card: '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        'card-hover': '0 4px 20px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.4)',
      },
      backgroundImage: {
        'gradient-card': 'linear-gradient(135deg, #12121A 0%, #0F0F17 100%)',
        'gradient-accent': 'linear-gradient(135deg, #5B8FF0 0%, #7B6FF0 100%)',
        'gradient-success': 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
      },
    },
  },
  plugins: [],
}

export default config
