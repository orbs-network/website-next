import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { SectionBackdrop } from './section-backdrop'

const meta = {
  title: 'Marketing/SectionBackdrop',
  component: SectionBackdrop,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="relative min-h-[26rem] bg-neutral-900 p-12">
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
