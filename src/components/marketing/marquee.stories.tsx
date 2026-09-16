import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'
import { Marquee } from './marquee'

const meta = {
  title: 'Marketing/Marquee',
  component: Marquee,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Marquee>

export default meta
type Story = StoryObj<typeof meta>

const PHRASES = ['One API.', 'Every on-chain order type.', 'Institutional-grade execution.']

const args = { phrases: PHRASES, pauseLabel: 'Pause', resumeLabel: 'Resume' }

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
 * Motion stops two ways, and both classes are load-bearing.
 *
 * `prefers-reduced-motion` covers someone who has asked their OS to calm
 * everything down. It does NOT satisfy WCAG 2.2.2 on its own — that asks for a
 * mechanism in the CONTENT to pause, stop or hide moving content running past
 * five seconds, and a media query is a user-agent preference. The checkbox is
 * that mechanism; see `ThePauseControlIsNamedAndOperable`.
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

/**
 * The control names itself, states itself, and actually stops the animation.
 *
 * `aria-pressed` rather than only swapping the word: it tells a screen reader
 * the toggle's state instead of leaving it to be inferred from a label that
 * changed. And the class assertion is the one that matters — a pause button
 * that toggles a class on the wrong element is a pause button that does not
 * pause.
 */
export const ThePauseControlIsNamedStatefulAndWorks: Story = {
  args,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const track = canvasElement.querySelector('.animate-marquee')

    const control = canvas.getByRole('button', { name: args.pauseLabel })
    await expect(control).toHaveAttribute('aria-pressed', 'false')
    await expect(track).not.toHaveClass('[animation-play-state:paused]')

    await userEvent.click(control)

    const pressed = canvas.getByRole('button', { name: args.resumeLabel })
    await expect(pressed).toHaveAttribute('aria-pressed', 'true')
    await expect(canvasElement.querySelector('.animate-marquee')).toHaveClass('[animation-play-state:paused]')
  },
}
