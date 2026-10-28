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
        ivory: {
          DEFAULT: '#F7F3E8',
          light: '#FCFAF5',
          dark: '#EFE9D7',
        },
        parchment: {
          DEFAULT: '#EDE4D1',
          light: '#F5EFE3',
          dark: '#DECDB5',
        },
        forest: {
          DEFAULT: '#173F2A',
          dark: '#0E291B',
          light: '#24593C',
          accent: '#55765A',
        },
        olive: {
          DEFAULT: '#667A3E',
          dark: '#4C5D2C',
          light: '#7F994D',
        },
        gold: {
          DEFAULT: '#B89A5A',
          dark: '#967B40',
          light: '#D4BA7B',
          muted: '#A58B4E',
        },
        walnut: {
          DEFAULT: '#654B36',
          dark: '#4D3828',
          light: '#806047',
        },
        ink: {
          DEFAULT: '#191B18',
          light: '#2D302B',
          muted: '#77776C',
        },
        charcoal: {
          DEFAULT: '#171916',
          elevated: '#20231F',
          card: '#272B25',
          border: '#323730',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Space Mono"', 'monospace'],
      },
      letterSpacing: {
        widest: '.2em',
        eyebrow: '.15em',
      },
      boxShadow: {
        'luxury': '0 20px 40px -15px rgba(23, 63, 42, 0.08), 0 0 1px 1px rgba(184, 154, 90, 0.15)',
        'luxury-dark': '0 20px 40px -15px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(184, 154, 90, 0.25)',
        'gold-glow': '0 0 25px rgba(184, 154, 90, 0.2)',
        'danger-glow': '0 0 30px rgba(197, 48, 48, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-up': 'fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
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
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
}
