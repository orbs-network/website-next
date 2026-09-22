import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

/**
 * `.band-contrast` — the inverted sections on the home page.
 *
 * These assert READABILITY rather than appearance, because the way this breaks
 * is invisible in a screenshot review. `color` is set once on `body` and
 * inherits as a resolved value, so an element inside a band that sets no colour
 * of its own keeps the surrounding theme's foreground — which is exactly the
 * colour of the band it now sits on.
 *
 * That shipped, briefly: the Discover links rendered white on white. The rules
 * between them still drew, so the section looked like an empty list rather than
 * a broken one, and it survived a side-by-side comparison against the design
 * because "three faint lines" is what an empty list looks like. A computed
 * contrast ratio does not have that problem.
 */

const meta = {
  title: 'Foundations/BandContrast',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Relative luminance, per WCAG 2.1. */
function luminance([r, g, b]: number[]): number {
  const channel = (value: number) => {
    const v = value / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }

  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

function parse(colour: string): number[] {
  const parts = colour.match(/\d+(\.\d+)?/g)
  if (!parts) throw new Error(`cannot parse colour: ${colour}`)
  return parts.slice(0, 3).map(Number)
}

function contrastRatio(a: string, b: string): number {
  const [x, y] = [luminance(parse(a)), luminance(parse(b))]
  const [light, dark] = x > y ? [x, y] : [y, x]

  return (light + 0.05) / (dark + 0.05)
}

/** The nearest ancestor with a non-transparent background. */
function resolvedBackground(el: Element): string {
  let node: Element | null = el

  while (node) {
    const bg = getComputedStyle(node).backgroundColor
    if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return bg
    node = node.parentElement
  }

  return 'rgb(255, 255, 255)'
}

/**
 * A band holding text that sets NO colour of its own — the exact shape that
 * failed. `text-fg` is not used anywhere here on purpose: an element that opts
 * in was never the broken case.
 */
function Band({ variant }: { variant: 'bg' | 'surface' }) {
  return (
    <div className={`band-contrast ${variant === 'bg' ? 'bg-bg' : 'bg-surface'} p-10`}>
      <p data-testid="plain">Uncoloured paragraph</p>
      {/*
        `#` rather than a real route: this is a fixture for an anchor that sets
        no colour of its own, and pointing it at `/blog/` only earns a lint
        complaint about not using `next/link` for a link that navigates nowhere.
      */}
      <a data-testid="link" href="#">
        Uncoloured link
      </a>
      <p data-testid="muted" className="text-fg-muted">
        Muted caption
      </p>
      {/*
        The accent, which `FeatureTabs` uses for its SELECTED tab label — the
        one piece of text in a band that a reader is meant to notice.
      */}
      <p data-testid="accent" className="text-accent-primary">
        Selected tab label
      </p>
    </div>
  )
}

/** WCAG AA for body text. The failure this guards was a ratio of 1.0. */
const AA_NORMAL = 4.5
/** AA for large text, which is what the muted captions sit closest to. */
const AA_LARGE = 3

function assertReadable(canvas: ReturnType<typeof within>, expectDark: boolean) {
  /*
    The theme is ASSERTED, not assumed.

    The first version of this file set `globals: { theme: 'dark' }`, which the
    preview decorator does not read — it keys off the backgrounds toolbar. Both
    "dark" stories therefore ran in light mode and never touched the
    `:root.dark .band-contrast` branch they existed to guard. The falsification
    still passed, because the light branch breaks the same way, so the whole
    thing looked convincing while proving half of what it claimed.
  */
  expect(document.documentElement.classList.contains('dark'), 'dark theme active').toBe(expectDark)

  for (const [id, minimum] of [
    ['plain', AA_NORMAL],
    ['link', AA_NORMAL],
    ['muted', AA_LARGE],
    ['accent', AA_NORMAL],
  ] as const) {
    const el = canvas.getByTestId(id)
    const ratio = contrastRatio(getComputedStyle(el).color, resolvedBackground(el))

    expect(ratio, `${id} contrast ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(minimum)
  }
}

export const DarkThemeBand: Story = {
  globals: { backgrounds: { value: '#121214' } },
  render: () => <Band variant="bg" />,
  play: async ({ canvasElement }) => assertReadable(within(canvasElement), true),
}

export const DarkThemeSurfaceBand: Story = {
  globals: { backgrounds: { value: '#121214' } },
  render: () => <Band variant="surface" />,
  play: async ({ canvasElement }) => assertReadable(within(canvasElement), true),
}

export const LightThemeBand: Story = {
  render: () => <Band variant="bg" />,
  play: async ({ canvasElement }) => assertReadable(within(canvasElement), false),
}

export const LightThemeSurfaceBand: Story = {
  render: () => <Band variant="surface" />,
  play: async ({ canvasElement }) => assertReadable(within(canvasElement), false),
}
