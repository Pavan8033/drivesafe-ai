/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // DriveSafe AI Luxury Palette (Strictly Aligned)
        'obsidian': {
          DEFAULT: '#171916',
          elevated: '#1E211D',
          card: '#222620',
          border: '#2E332B',
        },
        'emerald': {
          DEFAULT: '#173F2A',
          dark: '#0E281B',
          light: '#1F5338',
          glow: 'rgba(23, 63, 42, 0.4)',
        },
        'heritage': {
          DEFAULT: '#244A38',
          dark: '#1B382B',
          light: '#2E5D47',
        },
        'champagne': {
          DEFAULT: '#C4A66A',
          dark: '#A88B4F',
          light: '#D9C18B',
          muted: '#8E7745',
          glow: 'rgba(196, 166, 106, 0.25)',
        },
        'ivory': {
          DEFAULT: '#F7F3E8',
          light: '#FCFAF5',
          dark: '#EFE8D6',
        },
        'parchment': {
          DEFAULT: '#E9E0D0',
          light: '#F3EDE1',
          dark: '#DDD1BD',
        },
        'walnut': {
          DEFAULT: '#654B36',
          dark: '#4D3828',
          light: '#7D5F46',
        },
        'secondary-text': '#77776F',

        // Semantic & Backward-Compatible Aliases
        'forest': {
          DEFAULT: '#173F2A',
          dark: '#0E281B',
          light: '#244A38',
          accent: '#2E5D47',
        },
        'heritage-green': '#244A38',
        'royal-green': {
          DEFAULT: '#173F2A',
          light: '#244A38',
          dark: '#0E281B',
        },
        'gold': {
          DEFAULT: '#C4A66A',
          dark: '#A88B4F',
          light: '#D9C18B',
          muted: '#8E7745',
        },
        'antique-gold': {
          DEFAULT: '#C4A66A',
          light: '#D9C18B',
          dark: '#A88B4F',
        },
        'charcoal': {
          DEFAULT: '#171916',
          elevated: '#1E211D',
          card: '#222620',
          border: '#2E332B',
        },
        'ink': {
          DEFAULT: '#171916',
          light: '#262923',
          muted: '#77776F',
        },
        'ink-muted': '#77776F',
        'warm-ivory': {
          DEFAULT: '#F7F3E8',
          light: '#FCFAF5',
          dark: '#EFE8D6',
        },
        'muted-parchment': '#E9E0D0',
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Space Mono"', 'monospace'],
      },
      letterSpacing: {
        widest: '.2em',
        eyebrow: '.18em',
      },
      boxShadow: {
        'luxury': '0 20px 40px -15px rgba(23, 63, 42, 0.12), 0 0 1px 1px rgba(196, 166, 106, 0.25)',
        'luxury-dark': '0 20px 45px -15px rgba(0, 0, 0, 0.75), 0 0 1px 1px rgba(196, 166, 106, 0.25)',
        'gold-glow': '0 0 30px rgba(196, 166, 106, 0.25)',
        'emerald-glow': '0 0 30px rgba(23, 63, 42, 0.4)',
        'danger-glow': '0 0 35px rgba(220, 38, 38, 0.45)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-up': 'fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        'float-slow': 'floatSlow 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.65' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
}
