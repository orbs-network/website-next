import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { HeroFacetField } from './hero-facet-field'
import { SectionBackdrop } from './section-backdrop'

/**
 * The hero backdrop, at the size it is used.
 *
 * The interaction itself cannot be told here — the field only mounts for a
 * fine pointer, and Storybook's `userEvent` dispatches synthetic pointer
 * events rather than moving a real cursor. What these stories DO cover is the
 * part with a history of breaking silently: the resting state.
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

    // Opacity belongs to the container, not the layers: 50% on each would
    // composite to 75% wherever a large dot covers the small one it replaces.
    expect(getComputedStyle(small!).opacity).toBe('1')
    expect(getComputedStyle(large!).opacity).toBe('1')
    expect(getComputedStyle(canvasElement.querySelector('.hero-dot-grid')!).opacity).toBe('0.5')

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
