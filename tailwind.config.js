/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        'gold-glow': 'var(--gold-glow)',
        'indigo-glow': 'var(--indigo-glow)',
        'purple-glow': 'var(--purple-glow)',
      },
      fontFamily: {
        sans: ['"Geist"', '"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Syne"', '"Geist"', 'sans-serif'],
        hebrew: ['"Heebo"', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'glow-indigo': '0 0 30px rgba(99,102,241,0.35)',
        'glow-purple': '0 0 30px rgba(168,85,247,0.3)',
        'glow-gold': '0 0 30px rgba(212,175,55,0.25)',
      },
    },
  },
  plugins: [],
}

