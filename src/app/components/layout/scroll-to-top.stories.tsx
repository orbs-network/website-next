import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ScrollToTop } from './scroll-to-top'

const meta = {
  title: 'Layout/ScrollToTop',
  component: ScrollToTop,
  // The button reveals itself on scroll, so the stories need a page tall enough
  // to scroll. Rendered as a sibling rather than a wrapper so the fixed-position
  // button is not trapped in a scroll container.
  decorators: [
    (Story) => (
      <>
        <div style={{ height: '4000px' }} />
        <Story />
      </>
    ),
  ],
} satisfies Meta<typeof ScrollToTop>

export default meta
type Story = StoryObj<typeof meta>

const LABEL = 'Back to top'

/** At the top of the page there is nothing to go back to, so nothing renders. */
export const HiddenAtTopOfPage: Story = {
  args: { label: LABEL },
  play: async ({ canvasElement }) => {
    window.scrollTo(0, 0)

    const canvas = within(canvasElement)
    await expect(canvas.queryByRole('button', { name: LABEL })).not.toBeInTheDocument()
  },
}

/**
 * Unmounted rather than merely invisible. The legacy button stayed in the DOM
 * at `opacity: 0`, which left keyboard users tabbing onto an invisible control
 * at the top of every page — the regression this asserts against.
 */
export const AppearsAfterScrollingAndReturnsToTop: Story = {
  args: { label: LABEL },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    window.scrollTo(0, 1200)
    window.dispatchEvent(new Event('scroll'))

    const button = await waitFor(() => canvas.getByRole('button', { name: LABEL }))

    await userEvent.click(button)

    await waitFor(async () => {
      await expect(window.scrollY).toBe(0)
    })
  },
}

/**
 * The Korean label is a real translation, so it carries no `lang` override;
 * English chrome inside a Korean document would. Asserted here because the
 * accessible name is the button's only content.
 */
export const CarriesTheLangOverrideItIsGiven: Story = {
  args: { label: 'Back to top', lang: 'en' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    window.scrollTo(0, 1200)
    window.dispatchEvent(new Event('scroll'))

    const button = await waitFor(() => canvas.getByRole('button', { name: 'Back to top' }))
    await expect(button).toHaveAttribute('lang', 'en')
  },
}
