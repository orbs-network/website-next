import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  plugins: [require('@tailwindcss/typography'), require('tailwindcss-animate')],
  theme: {
    extend: {
      /*
        The home page's scrolling band of phrases.

        Translating the whole track by exactly -50% works because the component
        renders its phrase list TWICE — at the halfway point the second copy
        sits exactly where the first started, so the reset is invisible. Any
        other distance produces a visible jump.

        Duration is long on purpose: a marquee fast enough to notice is a
        marquee nobody can read. `motion-reduce:animate-none` at the call site
        stops it entirely, which is what keeps this the right side of WCAG
        2.2.2 — continuously moving text with no pause control.
      */
      /*
        Section padding, from the design rather than from the default scale.

        `3.4 Home` uses 100px top and bottom on its content sections —
        `Products Content Area` is exactly 100 + 640 content + 100 = 840. The
        Tailwind scale jumps 96 (py-24) to 112 (py-28), so neither lands on it,
        and `py-20` (80px) is what the first pass used throughout. Named rather
        than arbitrary so the next page does not re-derive it.
      */
      spacing: {
        section: '6.25rem',
      },
      /*
        The design's background grid, as CSS rather than a 173 KB exported SVG.

        Measured off `orbs-grid-clean-editable 3`: lines at #424651, 1.2px, 23%
        opacity, spaced ~66px (verticals at x=35, 102, 168).

        The design also scatters small coloured squares at some intersections —
        #B0C2FE and #B5EDFF at 20-24px. Those are NOT reproduced: they sit at
        specific intersections rather than a repeating one, which a gradient
        cannot express. An SVG could, at background weight nobody sees. Noted
        as a deliberate loss rather than an oversight.
      */
      backgroundImage: {
        'grid-lines':
          'repeating-linear-gradient(to right, rgb(66 70 81 / 0.23) 0 1.2px, transparent 1.2px 66px), repeating-linear-gradient(to bottom, rgb(66 70 81 / 0.23) 0 1.2px, transparent 1.2px 66px)',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        // Literal palette ladders
        neutral: {
          100: 'var(--color-neutral-100)',
          200: 'var(--color-neutral-200)',
          300: 'var(--color-neutral-300)',
          400: 'var(--color-neutral-400)',
          500: 'var(--color-neutral-500)',
          600: 'var(--color-neutral-600)',
          700: 'var(--color-neutral-700)',
          900: 'var(--color-neutral-900)',
        },
        periwinkle: {
          100: 'var(--color-periwinkle-100)',
          200: 'var(--color-periwinkle-200)',
          300: 'var(--color-periwinkle-300)',
          400: 'var(--color-periwinkle-400)',
          500: 'var(--color-periwinkle-500)',
          600: 'var(--color-periwinkle-600)',
          700: 'var(--color-periwinkle-700)',
        },
        pink: {
          100: 'var(--color-pink-100)',
          200: 'var(--color-pink-200)',
          300: 'var(--color-pink-300)',
          400: 'var(--color-pink-400)',
          500: 'var(--color-pink-500)',
          600: 'var(--color-pink-600)',
          700: 'var(--color-pink-700)',
        },
        cyan: {
          100: 'var(--color-cyan-100)',
          200: 'var(--color-cyan-200)',
          300: 'var(--color-cyan-300)',
          400: 'var(--color-cyan-400)',
          500: 'var(--color-cyan-500)',
          600: 'var(--color-cyan-600)',
          700: 'var(--color-cyan-700)',
        },
        lilac: {
          100: 'var(--color-lilac-100)',
          200: 'var(--color-lilac-200)',
          300: 'var(--color-lilac-300)',
          400: 'var(--color-lilac-400)',
          500: 'var(--color-lilac-500)',
          600: 'var(--color-lilac-600)',
          700: 'var(--color-lilac-700)',
        },
        indigo: {
          100: 'var(--color-indigo-100)',
          200: 'var(--color-indigo-200)',
          300: 'var(--color-indigo-300)',
          400: 'var(--color-indigo-400)',
          500: 'var(--color-indigo-500)',
          600: 'var(--color-indigo-600)',
          700: 'var(--color-indigo-700)',
        },
        coral: {
          100: 'var(--color-coral-100)',
          200: 'var(--color-coral-200)',
          300: 'var(--color-coral-300)',
          400: 'var(--color-coral-400)',
          500: 'var(--color-coral-500)',
          600: 'var(--color-coral-600)',
          700: 'var(--color-coral-700)',
        },

        // Semantic aliases
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        fg: 'var(--color-fg)',
        'fg-muted': 'var(--color-fg-muted)',
        'accent-primary': 'var(--color-accent-primary)',
        'accent-primary-hover': 'var(--color-accent-primary-hover)',
        link: 'var(--color-link)',

        // shadcn shims — keep the DEFAULT/foreground nested shape so existing
        // shadcn components continue to resolve. These now route through the
        // new semantic tokens via the CSS variable shims in globals.css.
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        border: 'var(--color-border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
      },
      fontSize: {
        h1: ['var(--font-size-h1)', { lineHeight: 'var(--line-height-h1)', letterSpacing: 'var(--tracking-tight)' }],
        h2: ['var(--font-size-h2)', { lineHeight: 'var(--line-height-h2)', letterSpacing: 'var(--tracking-tight)' }],
        h3: ['var(--font-size-h3)', { lineHeight: 'var(--line-height-h3)', letterSpacing: 'var(--tracking-tight)' }],
        h4: ['var(--font-size-h4)', { lineHeight: 'var(--line-height-h4)', letterSpacing: 'var(--tracking-tight)' }],
        h5: ['var(--font-size-h5)', { lineHeight: 'var(--line-height-h5)', letterSpacing: 'var(--tracking-wider)' }],
        p: ['var(--font-size-p)', { lineHeight: 'var(--line-height-p)' }],
        detail: [
          'var(--font-size-detail)',
          { lineHeight: 'var(--line-height-detail)', letterSpacing: 'var(--tracking-wide)' },
        ],
        field: ['var(--font-size-field)', { lineHeight: 'var(--line-height-field)' }],
      },
    },
  },
}
export default config
