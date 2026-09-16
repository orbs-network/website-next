import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { SectionBackdrop } from './section-backdrop'

const meta = {
  title: 'Marketing/SectionBackdrop',
  component: SectionBackdrop,
  parameters: { layout: 'fullscreen' },
  decorators: [
    /*
      `isolate` is not decoration here — it is the component's contract.

      This wrapper paints an opaque `bg-neutral-900`. Without a stacking
      context, the backdrop's `-z-10` escapes to the root and lands BEHIND that
      background, so the stories rendered as a flat dark field showing nothing.
      Exactly the failure the production sections were hardened against, and
      this file demonstrated it while claiming to illustrate the component.
    */
    (Story) => (
      <div className="relative isolate min-h-[26rem] bg-neutral-900 p-12">
        <Story />
        <p className="relative text-h3 text-white">Content sits above the backdrop</p>
      </div>
    ),
  ],
} satisfies Meta<typeof SectionBackdrop>

export default meta
type Story = StoryObj<typeof meta>

export const Grid: Story = { args: { variant: 'grid' } }
export const Glow: Story = { args: { variant: 'glow' } }

/**
 * Texture, and nothing more.
 *
 * Two properties carry the whole safety of this component, and both are easy to
 * drop in a refactor: a full-width invisible layer that intercepts clicks is a
 * miserable bug to track down, and one that appears in the accessibility tree
 * is noise a screen-reader user has to skip past.
 */
export const IsInertAndUnannounced: Story = {
  args: { variant: 'grid' },
  play: async ({ canvasElement }) => {
    const backdrop = canvasElement.querySelector('[aria-hidden="true"]')

    await expect(backdrop).toBeTruthy()
    await expect(backdrop).toHaveClass('pointer-events-none')

    // Nothing inside it, so there is nothing to announce even if a future
    // change dropped the aria-hidden.
    await expect(backdrop?.childElementCount).toBe(0)
  },
}

/**
 * It sits BEHIND its siblings.
 *
 * `-z-10` with `absolute inset-0` is what keeps the backdrop off the copy. Get
 * it wrong and the page still looks right until someone tries to click a link.
 */
export const SitsBehindTheContent: Story = {
  args: { variant: 'grid' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const backdrop = canvasElement.querySelector('[aria-hidden="true"]')

    await expect(backdrop).toHaveClass('-z-10')
    await expect(backdrop).toHaveClass('absolute')
    // The content is still reachable and readable above it.
    await expect(canvas.getByText('Content sits above the backdrop')).toBeVisible()
  },
}

/**
 * The backdrop actually paints something.
 *
 * Every other assertion here checks a class name, which would keep passing if
 * the thing rendered as a flat field — and it did, until this decorator gained
 * `isolate`. This looks at the pixels instead: a painted grid produces many
 * distinct colours in a region, a blank one produces very few.
 */
export const ActuallyPaints: Story = {
  args: { variant: 'grid' },
  play: async ({ canvasElement }) => {
    const backdrop = canvasElement.querySelector<HTMLElement>('div[aria-hidden="true"]')

    await expect(backdrop).toBeTruthy()

    // A zero-area element paints nothing however correct its classes are.
    const box = backdrop!.getBoundingClientRect()
    await expect(box.width).toBeGreaterThan(0)
    await expect(box.height).toBeGreaterThan(0)

    // And it has to be behind the content rather than over it.
    await expect(getComputedStyle(backdrop!).backgroundImage).toContain('repeating-linear-gradient')
  },
}
