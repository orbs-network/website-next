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
  args: { text: TEXT, locale: 'en' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByText(/beta version under active development/)).toBeVisible()
    await expect(canvas.getByText(/may contain bugs/)).toBeVisible()
    await expect(canvas.getByText(/at your own risk/)).toBeVisible()
    // One paragraph per blank-line-separated clause.
    await expect(canvasElement.querySelectorAll('p')).toHaveLength(3)
  },
}

/**
 * English fine print inside a Korean document is marked per PARAGRAPH, not on
 * the section (#103).
 *
 * This story used to assert the opposite — a `lang` override on the
 * `<section>` — which is the pattern the issue removes. The section carrying
 * it meant one guess covering every string beneath, and a disclaimer is the
 * last place to keep a guess.
 */
export const EnglishCopyInAnotherLocale: Story = {
  args: { text: TEXT, locale: 'ko' },
  play: async ({ canvasElement }) => {
    const paragraphs = canvasElement.querySelectorAll('p')

    await expect(paragraphs).toHaveLength(3)
    for (const paragraph of paragraphs) {
      await expect(paragraph).toHaveAttribute('lang', 'en')
    }

    // The wrapper claims nothing about language any more.
    await expect(canvasElement.querySelector('section')).not.toHaveAttribute('lang')
  },
}
