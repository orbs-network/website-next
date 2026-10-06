import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { FeatureGrid } from './feature-grid'

const meta = {
  title: 'Marketing/FeatureGrid',
  component: FeatureGrid,
} satisfies Meta<typeof FeatureGrid>

export default meta
type Story = StoryObj<typeof meta>

const FEATURES = [
  { id: 'one', title: 'First', body: 'Body one.' },
  { id: 'two', title: 'Second', body: 'Body two.' },
]

/**
 * With a section heading the cards sit under it as `h3`. Without one the cards
 * ARE the top level of their section, so they become `h2` — otherwise the page
 * jumps `h1` straight to `h3` and heading navigation hits a gap.
 */
export const HeadingLevelFollowsTheSectionTitle: Story = {
  args: { title: 'Benefits', features: FEATURES, locale: 'en' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByRole('heading', { level: 2, name: 'Benefits' })).toBeInTheDocument()
    await expect(canvas.getAllByRole('heading', { level: 3 })).toHaveLength(2)
  },
}

export const CardsBecomeH2WithoutASectionTitle: Story = {
  args: { features: FEATURES, locale: 'en' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.queryAllByRole('heading', { level: 3 })).toHaveLength(0)
    await expect(canvas.getAllByRole('heading', { level: 2 })).toHaveLength(2)
  },
}

/**
 * A card with an `href` is a call to action. The link is named by the TITLE
 * alone — not the title plus body — while the whole card stays clickable.
 */
export const LinkedCardsAreNamedByTheirTitle: Story = {
  args: {
    title: 'Get started',
    features: [
      { id: 'docs', title: 'Read the Docs', body: 'Understand the tools.', href: 'https://example.com/docs' },
      { id: 'call', title: 'Make your first call', body: 'One line of code.', href: '/dtwap' },
    ],
    locale: 'en',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const external = canvas.getByRole('link', { name: 'Read the Docs' })
    await expect(external).toHaveAttribute('target', '_blank')
    await expect(external).toHaveAttribute('rel', 'noopener noreferrer')

    const internal = canvas.getByRole('link', { name: 'Make your first call' })
    await expect(internal).not.toHaveAttribute('target')
  },
}

/** Cards without an href stay inert — most grids describe rather than link. */
export const UnlinkedCardsAreNotLinks: Story = {
  args: { title: 'Benefits', features: FEATURES, locale: 'en' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryAllByRole('link')).toHaveLength(0)
  },
}

const FIVE_FEATURES = [
  ...FEATURES,
  { id: 'three', title: 'Third', body: 'Body three.' },
  { id: 'four', title: 'Fourth', body: 'Body four.' },
  { id: 'five', title: 'Fifth', body: 'Body five.' },
]

const desktop = {
  viewport: { options: { desktop1440: { name: 'Desktop 1440', styles: { width: '1440px', height: '1000px' } } } },
}

/** Three-card products use the full row, rather than leaving the third card alone. */
export const ThreeCardsFillOneDesktopRow: Story = {
  parameters: desktop,
  globals: { viewport: { value: 'desktop1440' } },
  args: { title: 'Benefits', features: FIVE_FEATURES.slice(0, 3), locale: 'en' },
  play: async ({ canvasElement }) => {
    const grid = canvasElement.querySelector('section > .grid')!
    const cards = [...grid.children].map((card) => card.getBoundingClientRect())
    await expect(cards).toHaveLength(3)
    await expect(cards.every((card) => Math.abs(card.top - cards[0].top) < 1)).toBe(true)
    await expect(Math.abs(cards[0].left - grid.getBoundingClientRect().left)).toBeLessThan(1)
    await expect(Math.abs(cards[2].right - grid.getBoundingClientRect().right)).toBeLessThan(1)
    await expect(cards.every((card) => Math.abs(card.width - cards[0].width) < 1)).toBe(true)
  },
}

/** Five cards keep equal widths, with the final pair centred below the first three. */
export const FiveCardsHaveACentredSecondRow: Story = {
  parameters: desktop,
  globals: { viewport: { value: 'desktop1440' } },
  args: { title: 'Benefits', features: FIVE_FEATURES, locale: 'en' },
  play: async ({ canvasElement }) => {
    const grid = canvasElement.querySelector('section > .grid')!.getBoundingClientRect()
    const cards = [...canvasElement.querySelector('section > .grid')!.children].map((card) =>
      card.getBoundingClientRect()
    )
    await expect(cards).toHaveLength(5)
    await expect(cards.slice(0, 3).every((card) => Math.abs(card.top - cards[0].top) < 1)).toBe(true)
    await expect(cards[3].top).toBeGreaterThan(cards[0].bottom)
    await expect(Math.abs(cards[3].top - cards[4].top)).toBeLessThan(1)
    await expect(cards.every((card) => Math.abs(card.width - cards[0].width) < 1)).toBe(true)
    await expect(Math.abs((cards[3].left + cards[4].right) / 2 - (grid.left + grid.right) / 2)).toBeLessThan(1)
  },
}

/** Desktop spans must not create empty columns or reorder the cards on a phone. */
export const FiveCardsStackOnPhones: Story = {
  parameters: {
    viewport: { options: { phone390: { name: 'Phone 390', styles: { width: '390px', height: '844px' } } } },
  },
  globals: { viewport: { value: 'phone390' } },
  args: { title: 'Benefits', features: FIVE_FEATURES, locale: 'en' },
  play: async ({ canvasElement }) => {
    const grid = canvasElement.querySelector('section > .grid')!.getBoundingClientRect()
    const cards = [...canvasElement.querySelector('section > .grid')!.children].map((card) =>
      card.getBoundingClientRect()
    )
    await expect(cards).toHaveLength(5)
    for (const [index, card] of cards.entries()) {
      await expect(Math.abs(card.left - grid.left)).toBeLessThan(1)
      await expect(Math.abs(card.right - grid.right)).toBeLessThan(1)
      if (index) await expect(card.top).toBeGreaterThan(cards[index - 1].bottom)
    }
  },
}
