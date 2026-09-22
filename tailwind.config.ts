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
        /*
          The closing call to action's glow.
          In the design this is a group of three ~1200px circles — indigo
          #3346f2, pink #dc8ae0 and cyan #2cedfc, each blurred by 400 — sitting
          BELOW the section with a #121214 circle over their middle. What a
          reader sees is therefore the top arc of that arrangement: a wide band
          along the bottom edge running cyan on the left, through blue, to pink
          on the right, fading upward into the page.
          Reproduced as three radial gradients centred past the bottom edge
          rather than as an export. The design's own version is a 1463x1374
          group of blurred ellipses; rasterising that is a large image for
          something gradients draw exactly, at any width, for nothing.
          Centres and hues are the design's, converted from the Figma node
          geometry; the vertical offsets put the circles low enough that only
          the arc shows, which is what makes the blur unnecessary.
        */
        'orbs-glow': [
          // Deliberately LARGER than the section. The design's circles are
          // ~1200px across with a 400 blur, against a field about 520px tall,
          // so their soft edges wash the whole area rather than sitting in a
          // band at the bottom. Measured down the centre column, the design
          // never drops below ~35/255 anywhere in this field; a first attempt
          // with section-sized circles read 11 at the top, which is why the
          // marquee looked like it was on flat black.
          'radial-gradient(85% 150% at 18% 118%, rgb(44 237 252 / 0.55), transparent 72%)',
          'radial-gradient(90% 150% at 80% 118%, rgb(220 138 224 / 0.50), transparent 72%)',
          'radial-gradient(80% 145% at 50% 124%, rgb(51 70 242 / 0.65), transparent 70%)',
          'radial-gradient(38% 52% at 52% 108%, rgb(202 208 246 / 0.85), transparent 70%)',
          /*
            The design's `Center Circle`: a #121214 disc over the middle of the
            three, which is what turns a blob into a rim and is why the glow
            fades back to the page colour at the very bottom edge rather than
            being brightest there. `var(--color-bg)` rather than a literal, so
            it still reads as the page in either theme.
          */
          'radial-gradient(42% 54% at 50% 140%, var(--color-bg) 0 55%, transparent 78%)',
        ].join(', '),
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
