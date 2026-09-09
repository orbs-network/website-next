import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { Disclaimer } from './disclaimer'

const meta = {
  title: 'Marketing/Disclaimer',
  component: Disclaimer,
} satisfies Meta<typeof Disclaimer>

export default meta
type Story = StoryObj<typeof meta>

const TEXT =
  'The Perpetual Hub is a beta version under active development.\n\n(a) may contain bugs, errors, and defects,\n\nAny use is at your own risk.'

/**
 * A risk disclosure, so it must be present and readable — not collapsed behind
 * a toggle, and not visually hidden. Styling it down is the point; hiding it
 * would be the one choice here with consequences beyond taste.
 */
export const RendersEveryClause: Story = {
  args: { text: TEXT },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByText(/beta version under active development/)).toBeVisible()
    await expect(canvas.getByText(/may contain bugs/)).toBeVisible()
    await expect(canvas.getByText(/at your own risk/)).toBeVisible()
    // One paragraph per blank-line-separated clause.
    await expect(canvasElement.querySelectorAll('p')).toHaveLength(3)
  },
}

/** Carries a `lang` override when the copy is English inside another locale. */
export const CarriesLangOverride: Story = {
  args: { text: TEXT, lang: 'en' },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('section')).toHaveAttribute('lang', 'en')
  },
}
