import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { CardRail } from './card-rail'

const meta = {
  title: 'Marketing/CardRail',
  component: CardRail,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CardRail>

export default meta
type Story = StoryObj<typeof meta>

const cards = Array.from({ length: 6 }, (_, index) => (
  <li key={index} className="w-[19rem] shrink-0 snap-start rounded-sm border border-border p-6">
    Card {index + 1}
  </li>
))

const args = {
  children: cards,
  label: 'In the news',
  previousLabel: 'Previous articles',
  nextLabel: 'More articles',
}

export const Default: Story = { args }

/** Both arrows are named. Unlabelled icon buttons are announced as "button". */
export const ArrowsAreNamed: Story = {
  args,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByRole('button', { name: args.previousLabel })).toBeInTheDocument()
    await expect(canvas.getByRole('button', { name: args.nextLabel })).toBeInTheDocument()
  },
}

/**
 * At the start there is nowhere to go back to, so the back arrow is disabled
 * rather than being a button that does nothing when pressed.
 */
export const BackIsDisabledAtTheStart: Story = {
  args,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByRole('button', { name: args.previousLabel })).toBeDisabled()
  },
}

/**
 * The strip has to be focusable.
 *
 * It scrolls, and a scroll container that cannot take focus cannot be scrolled
 * from the keyboard — the arrows are an addition, not the only way through.
 */
export const TheStripIsKeyboardReachable: Story = {
  args,
  play: async ({ canvasElement }) => {
    const strip = canvasElement.querySelector('ul[aria-label]')

    await expect(strip).toBeTruthy()
    await expect((strip as HTMLElement).tabIndex).toBe(0)
    await expect(strip).toHaveAttribute('aria-label', args.label)
  },
}
