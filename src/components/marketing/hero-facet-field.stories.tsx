import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, waitFor, within } from 'storybook/test'
import { HeroFacetField } from './hero-facet-field'
import { SectionBackdrop } from './section-backdrop'

/**
 * The hero backdrop, at the size it is used.
 *
 * The hover interaction cannot be told here — Storybook's `userEvent`
 * dispatches synthetic pointer events rather than moving a real cursor. A tap
 * can be, because it is two events the field listens for directly; see
 * `TapRipplesAndSettles`. What the rest cover is the part with a history of
 * breaking silently: the resting state.
 *
 * The dot grid is the design's background. It has to be right with no
 * JavaScript, no pointer and no canvas, because that is what most readers see
 * for most of the time the hero is on screen — and because the hero spent two
 * releases wearing a completely different grid without anyone noticing.
 */
const meta = {
  title: 'Marketing/HeroFacetField',
  component: HeroFacetField,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="relative isolate h-[500px] w-full overflow-hidden bg-background">
        <Story />
        <p className="relative p-10 text-h3 text-fg">Trading infrastructure</p>
      </div>
    ),
  ],
} satisfies Meta<typeof HeroFacetField>

export default meta
type Story = StoryObj<typeof meta>

export const Resting: Story = {
  args: {
    children: <SectionBackdrop variant="dots" />,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Decorative and inert. An invisible full-width layer that takes a click
    // meant for the copy above it is a genuinely horrible bug to find.
    const field = canvasElement.querySelector('[aria-hidden="true"]')
    expect(field).not.toBeNull()
    expect(getComputedStyle(field as Element).pointerEvents).toBe('none')

    // The dots survive to the DOM as real masked layers rather than as an
    // empty div waiting for script to fill it.
    const small = canvasElement.querySelector('.hero-dot-grid-small')
    const large = canvasElement.querySelector('.hero-dot-grid-large')
    expect(small).not.toBeNull()
    expect(large).not.toBeNull()

    const maskOf = (el: Element) => {
      const s = getComputedStyle(el)

      return { image: s.maskImage || s.webkitMaskImage, size: s.maskSize || s.webkitMaskSize }
    }

    expect(maskOf(small!).image).toContain('url(')
    expect(maskOf(small!).size).toContain('40.5px')

    /*
      The larger dots land on every FIFTH lattice point, so their tile must be
      exactly five cells across. Asserted as the arithmetic rather than as the
      literal 202.5, because the relationship is the design fact — a tile at
      any other multiple still tiles cleanly and still looks like a grid, just
      not this one.
    */
    expect(maskOf(large!).image).toContain('url(')
    const largePitch = Number.parseFloat(maskOf(large!).size)
    expect(largePitch).toBeCloseTo(40.5 * 5, 5)

    /*
      Opacity belongs to the container, not the layers: applied to each, the
      large dots would composite against the small ones they replace and read
      brighter than the rest of the grid.

      0.3 is the design's EFFECTIVE value, not the 0.5 on its fill — Figma
      multiplies down the node chain and the `grid pattern` group above the
      vector is at 0.6. Pinned here because 0.5 is what the file appears to say
      and is what this shipped first.
    */
    expect(getComputedStyle(small!).opacity).toBe('1')
    expect(getComputedStyle(large!).opacity).toBe('1')
    expect(getComputedStyle(canvasElement.querySelector('.hero-dot-grid')!).opacity).toBe('0.3')

    // Nothing here is content.
    expect(canvas.queryByRole('img')).toBeNull()
  },
}

/**
 * With no hole punched, which is the state every reader without a mouse sees
 * permanently.
 *
 * `--hero-facet-hole` defaults to `0px`, and at zero the radial gradient is
 * its final stop everywhere — fully opaque, so the grid is untouched. Asserted
 * because the obvious reading of a zero-radius gradient is "transparent", and
 * getting it backwards would erase the entire grid for exactly the readers who
 * never get the enhancement.
 */
export const NoPointerLeavesTheGridIntact: Story = {
  args: {
    children: <SectionBackdrop variant="dots" />,
  },
  play: async ({ canvasElement }) => {
    const field = canvasElement.querySelector('.hero-dot-field') as HTMLElement

    expect(field).not.toBeNull()

    /*
      Either unset, or set to `0px` by a field that has mounted but never seen
      the pointer. Both are "no hole", and which one you get depends on whether
      the browser reports a fine pointer — headless Chromium does, a phone does
      not. Asserting only the unset case made this pass on a touch device and
      fail on the machine it was written on.
    */
    const hole = getComputedStyle(field).getPropertyValue('--hero-facet-hole').trim()
    expect(['', '0px']).toContain(hole)

    const mask = getComputedStyle(field).maskImage || getComputedStyle(field).webkitMaskImage
    expect(mask).toContain('radial-gradient')
    // The 0px default, resolved.
    expect(mask).toContain('0px')
  },
}

/**
 * A touch tap on the hero ripples the field open at the finger, and it closes
 * again on its own — the frame loop has nothing to wait for, so it stops.
 *
 * Dispatched as raw pointer events because that is exactly what the field
 * listens for: a touch `pointerdown` then `pointerup` in the same place. Both
 * land on the copy, not the field, which is `pointer-events-none` and has to
 * stay that way.
 */
export const TapRipplesAndSettles: Story = {
  args: {
    children: <SectionBackdrop variant="dots" />,
  },
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('[aria-hidden="true"]') as HTMLElement
    const copy = within(canvasElement).getByText('Trading infrastructure')
    const box = copy.getBoundingClientRect()
    const at = { clientX: box.left + 40, clientY: box.top + box.height / 2 }
    const touch = { pointerType: 'touch', pointerId: 7, isPrimary: true, bubbles: true, ...at }

    const hole = () => Number.parseFloat(getComputedStyle(root).getPropertyValue('--hero-facet-hole')) || 0

    // The canvas mounts after hydration-time media checks; wait for it before tapping.
    await waitFor(() => expect(root.querySelector('canvas')).not.toBeNull())
    expect(hole()).toBe(0)

    copy.dispatchEvent(new PointerEvent('pointerdown', touch))
    copy.dispatchEvent(new PointerEvent('pointerup', touch))

    // Opens at the finger...
    await waitFor(() => expect(hole()).toBeGreaterThan(40))
    const x = Number.parseFloat(getComputedStyle(root).getPropertyValue('--hero-facet-x'))
    expect(x).toBeCloseTo(at.clientX - root.getBoundingClientRect().left, 0)

    // ...and closes with no further input.
    await waitFor(() => expect(hole()).toBe(0), { timeout: 3000 })
  },
}

/**
 * A swipe is not a tap. The browser takes a scrolling swipe with
 * `pointercancel`; one it lets through still moves further than a tap may.
 * Neither may ripple, or the field would fire every time the reader scrolled
 * past the hero.
 */
export const SwipeDoesNotRipple: Story = {
  args: {
    children: <SectionBackdrop variant="dots" />,
  },
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('[aria-hidden="true"]') as HTMLElement
    const copy = within(canvasElement).getByText('Trading infrastructure')
    const box = copy.getBoundingClientRect()
    const base = { pointerType: 'touch', isPrimary: true, bubbles: true, clientX: box.left + 40 }

    await waitFor(() => expect(root.querySelector('canvas')).not.toBeNull())

    copy.dispatchEvent(new PointerEvent('pointerdown', { ...base, pointerId: 8, clientY: box.top + 100 }))
    copy.dispatchEvent(new PointerEvent('pointercancel', { ...base, pointerId: 8, clientY: box.top + 60 }))

    copy.dispatchEvent(new PointerEvent('pointerdown', { ...base, pointerId: 9, clientY: box.top + 100 }))
    copy.dispatchEvent(new PointerEvent('pointerup', { ...base, pointerId: 9, clientY: box.top + 40 }))

    // Long enough for a tap's bloom to be well under way.
    await new Promise((resolve) => setTimeout(resolve, 300))
    expect(getComputedStyle(root).getPropertyValue('--hero-facet-hole').trim()).toMatch(/^(0px)?$/)
  },
}
