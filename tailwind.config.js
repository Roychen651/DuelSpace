/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // ── Color system — all mapped to CSS variables ──────────────────────────
      colors: {
        // Core page backgrounds
        background: 'var(--background)',   // bg-background
        foreground: 'var(--foreground)',   // text-foreground
        surface: {
          DEFAULT:  'var(--surface)',          // bg-surface
          elevated: 'var(--surface-elevated)', // bg-surface-elevated
          sunken:   'var(--surface-sunken)',   // bg-surface-sunken
        },
        // Card / glass
        card:  'var(--card-bg)',   // bg-card
        glass: 'var(--glass-bg)', // bg-glass

        // Semantic text
        main:   'var(--text-main)',       // text-main   (headings / body)
        muted:  'var(--text-muted)',      // text-muted  (labels / captions)
        subtle: 'var(--text-secondary)',  // text-subtle (secondary text)
        dim:    'var(--text-tertiary)',   // text-dim    (very low-contrast hints)

        // Border / glass edges
        'glass-border': 'var(--border-glass)', // border-glass-border (or: border-[color:var(...)])

        // Input / form controls
        'input-bg':     'var(--input-bg)',
        'input-border': 'var(--input-border)',

        // Dropdown / overlay
        'dropdown-bg': 'var(--dropdown-bg)',
        overlay:       'var(--overlay-bg)',

        // Accent palette
        'gold-glow':   'var(--glow-gold)',
        'indigo-glow': 'var(--glow-indigo)',
        'purple-glow': 'var(--glow-purple)',
      },

      // ── Font families — match what index.css actually loads ─────────────────
      fontFamily: {
        sans:    ['"Plus Jakarta Sans"', '"Rubik"', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', '"Rubik"', 'system-ui', 'sans-serif'],
        hebrew:  ['"Rubik"', '"Plus Jakarta Sans"', 'sans-serif'],
        accent:  ['"Syne"', '"Plus Jakarta Sans"', 'sans-serif'],
        a11y:    ['"Atkinson Hyperlegible"', 'Arial', 'sans-serif'],
      },

      // ── Shadows — mapped to CSS variables ───────────────────────────────────
      boxShadow: {
        card:         'var(--card-shadow)',
        'card-hover': 'var(--card-hover-shadow)',
        dropdown:     'var(--dropdown-shadow)',
        nav:          'var(--nav-shadow)',
        'glow-indigo': '0 0 30px var(--glow-indigo)',
        'glow-purple': '0 0 30px var(--glow-purple)',
        'glow-gold':   '0 0 30px var(--glow-gold)',
      },

      // ── Animations & keyframes ───────────────────────────────────────────────
      animation: {
        float:       'float 6s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-10px)' },
        },
      },

      // ── Backdrop blur ────────────────────────────────────────────────────────
      backdropBlur: {
        glass: '24px',
      },
    },
  },
  plugins: [],
}
