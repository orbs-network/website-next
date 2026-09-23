import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect } from 'storybook/test'

/**
 * Contrast of the semantic colour tokens, computed rather than eyeballed.
 *
 * These assert READABILITY, and the reason they exist is that this class of
 * defect is invisible in review. `--color-accent-primary` was indigo/400 in
 * BOTH themes — correct on the light page, 2.94:1 on the dark one — and it
 * shipped that way through every screenshot comparison, because a slightly
 * dark blue on near-black still looks like a colour rather than like a bug.
 *
 * The rule each pair is held to depends on what the colour DOES. A token used
 * as text is checked against the surface behind it; a token used as a filled
 * surface is checked against the text that sits on it. Those are opposite
 * requirements, and conflating them is how fixing the accent nearly broke the
 * primary button.
 */

/*
  As `rgb()` strings, because that is what `getComputedStyle` returns and the
  comparison is against it. Written as hex first and parsed, they were not:
  `parse()` pulls number runs out of a string, which on '#f6f6f6' yields 6,6,6
  rather than 246,246,246. The themes were right; the assertion was not.
*/
const LIGHT_BG = 'rgb(246, 246, 246)'
const DARK_BG = 'rgb(18, 18, 20)'

const meta = {
  title: 'Foundations/TokenContrast',
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

function ratio(a: string, b: string): number {
  const [x, y] = [luminance(parse(a)), luminance(parse(b))]
  const [light, dark] = x > y ? [x, y] : [y, x]

  return (light + 0.05) / (dark + 0.05)
}

/**
 * Resolve a custom property to a real colour.
 *
 * Read off a live element rather than from the stylesheet text, so the whole
 * `var()` chain is followed — `--accent` pointing at `--color-accent-primary`
 * pointing at a palette stop is exactly the indirection that hid #179.
 */
function token(el: HTMLElement, name: string): string {
  const probe = document.createElement('span')
  probe.style.color = `var(${name})`
  el.appendChild(probe)
  const value = getComputedStyle(probe).color
  probe.remove()

  return value
}

/** Text tokens, checked against the surface they sit on. */
const TEXT_ON_SURFACE = [
  ['--color-fg', '--color-bg'],
  ['--color-fg-muted', '--color-bg'],
  ['--color-accent-primary', '--color-bg'],
  ['--color-accent-primary-hover', '--color-bg'],
  ['--color-link', '--color-bg'],
  /*
    Destructive is checked as TEXT, not as a fill, because that is the only
    way it is used — `text-destructive` on the newsletter's error message.
    `bg-destructive` has no call sites at all, so `--destructive-foreground`
    never renders against `--destructive`.

    Listed here after the first version of this file put the pair in
    TEXT_ON_FILL below and reported 2.84:1. True of the two values, and not a
    defect the site can exhibit — a test asserting a combination the app never
    renders would have had someone change a colour to satisfy it.
  */
  ['--destructive', '--color-bg'],
  /*
    `--primary` and `--secondary` are TEXT in this codebase, not fills.
    `bg-primary` has no usages at all; `text-primary` has five, the links on
    the Contentful post pages, with `hover:text-secondary` beside them. The
    `Button` is outlined rather than filled and touches neither.

    Checked here rather than in TEXT_ON_FILL below for that reason — their
    names suggest surfaces and their use is text, which is exactly the
    assumption that nearly shipped indigo/400 links at 2.94:1 in dark.
  */
  ['--primary', '--color-bg'],
  ['--secondary', '--color-bg'],
] as const

/**
 * Filled surfaces, checked against the text ON them — the opposite direction.
 */
const TEXT_ON_FILL = [['--accent-foreground', '--accent']] as const

function check(root: HTMLElement, theme: string) {
  const failures: string[] = []

  for (const [fg, bg] of [...TEXT_ON_SURFACE, ...TEXT_ON_FILL]) {
    const value = ratio(token(root, fg), token(root, bg))
    if (value < 4.5) failures.push(`${theme}: ${fg} on ${bg} is ${value.toFixed(2)}:1`)
  }

  return failures
}

export const LightTheme: Story = {
  render: () => <div data-testid="probe" className="bg-background p-10 text-foreground" />,
  play: async ({ canvasElement }) => {
    document.documentElement.classList.remove('dark')
    const root = canvasElement.querySelector('[data-testid="probe"]') as HTMLElement

    expect(getComputedStyle(root).backgroundColor).toBe(LIGHT_BG)
    expect(check(root, 'light')).toEqual([])
  },
}

export const DarkTheme: Story = {
  globals: { backgrounds: { value: '#121214' } },
  render: () => <div data-testid="probe" className="bg-background p-10 text-foreground" />,
  play: async ({ canvasElement }) => {
    /*
      Asserted, not assumed. A story that believes it is in dark mode but is
      not passes for the wrong reason — the light branch of this file breaks
      identically, so both would look green. That happened once already, in
      the band-contrast stories.
    */
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    const root = canvasElement.querySelector('[data-testid="probe"]') as HTMLElement
    expect(getComputedStyle(root).backgroundColor).toBe(DARK_BG)

    expect(check(root, 'dark')).toEqual([])
  },
}
