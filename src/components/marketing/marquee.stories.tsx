import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { Marquee } from './marquee'

const meta = {
  title: 'Marketing/Marquee',
  component: Marquee,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Marquee>

export default meta
type Story = StoryObj<typeof meta>

const PHRASES = ['One API.', 'Every on-chain order type.', 'Institutional-grade execution.']

export const Default: Story = { args: { phrases: PHRASES } }

/**
 * The phrases exist twice so the loop has no seam — and a screen reader must
 * hear them once.
 *
 * The duplicate is the part that is easy to ship wrong: it looks identical and
 * doubles everything in the accessibility tree.
 */
export const TheDuplicateTrackIsHiddenFromAssistiveTech: Story = {
  args: { phrases: PHRASES },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Twice in the DOM, which is what makes the loop seamless.
    await expect(canvasElement.querySelectorAll('li')).toHaveLength(PHRASES.length * 2)

    // Once in the ACCESSIBILITY TREE, which is what matters. `getAllByRole`
    // is the query that proves it — it honours `aria-hidden`, where
    // `getByText` walks the DOM and would happily find both copies. (It did:
    // the first version of this assertion failed with "found multiple
    // elements", which is the DOM answering a question about the a11y tree.)
    await expect(canvas.getAllByRole('listitem')).toHaveLength(PHRASES.length)
  },
}

/**
 * Motion is opt-out via `prefers-reduced-motion`.
 *
 * Text that scrolls forever with no pause control fails WCAG 2.2.2 once it runs
 * past five seconds, and this runs indefinitely. `motion-reduce:animate-none`
 * is what keeps it the right side of that, so the class is load-bearing rather
 * than a nicety — hence a test that it is actually present.
 */
export const MotionStopsWhenReducedMotionIsPreferred: Story = {
  args: { phrases: PHRASES },
  play: async ({ canvasElement }) => {
    const track = canvasElement.querySelector('.animate-marquee')

    await expect(track).toBeTruthy()
    await expect(track).toHaveClass('motion-reduce:animate-none')
  },
}
