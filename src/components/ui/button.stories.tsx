import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, waitFor, within } from 'storybook/test'
import { Download } from 'lucide-react'

import { FACET_GRADIENT_STOPS } from '@/components/marketing/hero-facets'

import { Button } from './button'

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'solid', 'overlay'],
      description: 'Visual style of the button',
    },
    size: {
      control: 'select',
      options: ['sm', 'default'],
      description: 'Size of the button',
    },
    asChild: {
      control: 'boolean',
      description: 'Render as a child component using Radix Slot',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    noIcon: {
      control: 'boolean',
      description: 'Suppress the trailing icon (primary variant only)',
    },
  },
  args: {
    onClick: fn(),
    children: 'Get in Touch',
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

// Primary variant states
export const Primary: Story = {
  args: {
    variant: 'primary',
  },
}

export const PrimaryDisabled: Story = {
  args: {
    variant: 'primary',
    disabled: true,
  },
}

export const PrimaryNoIcon: Story = {
  args: {
    variant: 'primary',
    noIcon: true,
  },
}

export const PrimaryCustomIcon: Story = {
  args: {
    variant: 'primary',
    children: 'Download',
    icon: <Download className="size-4" />,
  },
}

// Secondary variant states
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Join Community',
  },
}

export const SecondaryDisabled: Story = {
  args: {
    variant: 'secondary',
    children: 'Join Community',
    disabled: true,
  },
}

/**
 * Solid: the hero's main action. Filled with the text colour, so the label has
 * to take the BACKGROUND colour or it disappears into its own fill. And it
 * keeps the arrow, unlike `secondary`.
 */
export const Solid: Story = {
  args: {
    variant: 'solid',
    children: 'Talk to the team',
  },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button')
    const style = getComputedStyle(button)

    await expect(style.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    await expect(style.color).not.toBe(style.backgroundColor)
    await expect(button.querySelector('svg')).toBeTruthy()
  },
}

/** Relative luminance, per WCAG 2.1, of an `rgb()`/`rgba()` string. */
function luminance(colour: string): number {
  const channel = (value: number) => {
    const v = value / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  const [r, g, b] = rgba(colour)

  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

function rgba(colour: string): [number, number, number, number] {
  const parts = colour.match(/\d+(\.\d+)?/g)
  if (!parts || parts.length < 3) throw new Error(`cannot parse colour: ${colour}`)
  const [r, g, b, a = 1] = parts.map(Number)

  return [r, g, b, a]
}

function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)]
  const [light, dark] = x > y ? [x, y] : [y, x]

  return (light + 0.05) / (dark + 0.05)
}

/** Every stylesheet rule this page can read, flattened out of `@media` and `@layer`. */
function styleRules(): CSSStyleRule[] {
  const rules: CSSStyleRule[] = []
  const walk = (list: CSSRuleList) => {
    for (const rule of Array.from(list)) {
      if (rule instanceof CSSStyleRule) rules.push(rule)
      if (rule instanceof CSSGroupingRule) walk(rule.cssRules)
    }
  }

  for (const sheet of Array.from(document.styleSheets)) {
    // The Google Fonts sheet is cross-origin; reading its rules throws, and it has no `:hover` in it.
    if (sheet.href && new URL(sheet.href).origin !== location.origin) continue
    walk(sheet.cssRules)
  }

  return rules
}

/**
 * The colours `el` would compute to while hovered.
 *
 * A play function cannot put a real pointer over an element — `userEvent.hover`
 * dispatches events, and `:hover` is decided by the browser from the actual
 * pointer — so this applies the element's own `:hover` rules to a clone and
 * reads the clone. The clone sits beside the original, so `var()` resolves
 * against the same theme.
 */
function hoverColours(el: HTMLElement): { color: string; backgroundColor: string } {
  const clone = el.cloneNode(true) as HTMLElement

  for (const rule of styleRules()) {
    for (const selector of rule.selectorText.split(',')) {
      // Skips a `\:hover` inside an escaped class name such as `dark\:hover\:x`.
      const resting = selector.replace(/(?<!\\):hover/g, '').trim()
      if (resting === selector.trim() || resting === '' || !el.matches(resting)) continue

      for (const property of Array.from(rule.style)) {
        clone.style.setProperty(property, rule.style.getPropertyValue(property))
      }
    }
  }

  clone.style.transition = 'none'
  el.after(clone)
  const { color, backgroundColor } = getComputedStyle(clone)
  clone.remove()

  return { color, backgroundColor }
}

/** The facet field's own gradient, so the story shows the button over what it sits on in the hero. */
const FACET_BACKDROP = `linear-gradient(to bottom, ${FACET_GRADIENT_STOPS.map((stop) => `${stop.color} ${stop.offset * 100}%`).join(', ')})`

function OverlayOnFacets() {
  return (
    <div className="p-10" style={{ backgroundImage: FACET_BACKDROP }}>
      <Button variant="overlay" asChild>
        <a href="https://example.com">Explore SDK</a>
      </Button>
    </div>
  )
}

/**
 * Hover and focus must read at 4.5:1 or better, on a fill that is opaque —
 * opaque is what makes the number independent of whatever the facets are
 * doing behind it (#268). Focus is checked live; hover through its rules.
 */
async function expectOverlayReadable(canvasElement: HTMLElement) {
  const link = within(canvasElement).getByRole('link')

  const resting = getComputedStyle(link)
  await expect(rgba(resting.backgroundColor)[3]).toBe(1)

  const hover = hoverColours(link)
  await expect(rgba(hover.backgroundColor)[3]).toBe(1)
  await expect(hover.backgroundColor).not.toBe(resting.backgroundColor)
  await expect(contrast(hover.color, hover.backgroundColor)).toBeGreaterThanOrEqual(4.5)

  link.focus()
  await expect(link.matches(':focus-visible')).toBe(true)
  await waitFor(() => expect(getComputedStyle(link).backgroundColor).toBe(hover.backgroundColor))
  const focused = getComputedStyle(link)
  await expect(focused.color).toBe(hover.color)
  // Focus adds the ring on top of the hover look, so it is never the weaker state.
  await expect(focused.boxShadow).not.toBe('none')
  link.blur()
}

/**
 * Overlay: the home hero's "Explore SDK", over the facet field (#268). Looks
 * like `primary` at rest, but opaque; white fill with an indigo label on hover
 * and focus, the same pair in both themes.
 */
export const Overlay: Story = {
  render: () => <OverlayOnFacets />,
  play: async ({ canvasElement }) => {
    await expect(document.documentElement.classList.contains('dark')).toBe(false)
    await expectOverlayReadable(canvasElement)
  },
}

export const OverlayDark: Story = {
  globals: { backgrounds: { value: '#121214' } },
  render: () => <OverlayOnFacets />,
  play: async ({ canvasElement }) => {
    // Asserted, not assumed: a "dark" story still in light passes for the wrong reason.
    await expect(document.documentElement.classList.contains('dark')).toBe(true)
    await expectOverlayReadable(canvasElement)
  },
}

// Sizes
export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small',
  },
}

/**
 * Pins the design-system CTA (#229): 33px tall, 11px regular, 0.08em tracking.
 * The tracking check is the one worth having — a `tracking-*` utility on the
 * base class silently beats the token's letter-spacing, which is how the
 * button shipped at 0.025em before.
 */
export const Default: Story = {
  args: {
    size: 'default',
  },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button')
    const style = getComputedStyle(button)

    await expect(button.getBoundingClientRect().height).toBe(33)
    await expect(style.fontSize).toBe('11px')
    await expect(style.fontWeight).toBe('400')
    await expect(style.letterSpacing).toBe('0.88px')
  },
}

// All combinations
export const AllStates: Story = {
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <p className="text-detail uppercase tracking-wide text-fg-muted">Primary</p>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="primary">Get in Touch</Button>
          <Button variant="primary" disabled>
            Get in Touch
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <p className="text-detail uppercase tracking-wide text-fg-muted">Secondary</p>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="secondary">Join Community</Button>
          <Button variant="secondary" disabled>
            Join Community
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <p className="text-detail uppercase tracking-wide text-fg-muted">Sizes</p>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="secondary" size="sm">
            Small
          </Button>
          <Button variant="secondary" size="default">
            Default
          </Button>
        </div>
      </div>
    </div>
  ),
}

// Dark background rendering
export const AllStatesDark: Story = {
  parameters: {
    controls: { hideNoControlsWarning: true },
    backgrounds: { default: 'dark' },
  },
  render: () => (
    <div className="dark bg-bg p-8">
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="primary">Get in Touch</Button>
        <Button variant="primary" disabled>
          Get in Touch
        </Button>
        <Button variant="secondary">Join Community</Button>
        <Button variant="secondary" disabled>
          Join Community
        </Button>
      </div>
    </div>
  ),
}
