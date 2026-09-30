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

const args = { phrases: PHRASES, locale: 'en' as const }

export const Default: Story = { args }

/**
 * The phrases exist twice so the loop has no seam — and a screen reader must
 * hear them once.
 *
 * The duplicate is the part that is easy to ship wrong: it looks identical and
 * doubles everything in the accessibility tree.
 */
export const TheDuplicateTrackIsHiddenFromAssistiveTech: Story = {
  args,
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
 * Motion stops for readers who prefer reduced motion — the only stop left
 * since the pause control was removed at the client's request (see the note
 * in `marquee.tsx`).
 */
export const MotionStopsWhenReducedMotionIsPreferred: Story = {
  args,
  play: async ({ canvasElement }) => {
    const track = canvasElement.querySelector('.animate-marquee')

    await expect(track).toBeTruthy()
    // On the SAME element as the animation. `animation-play-state` on a
    // wrapper does nothing to the child, which is how a pause button ends up
    // not pausing.
    await expect(track).toHaveClass('motion-reduce:[animation-play-state:paused]')
  },
}

/** The pause control was removed on purpose; this fails if it creeps back. */
export const HasNoPauseControl: Story = {
  args,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('button')).toBeNull()
  },
}
