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
  args: { title: 'Benefits', features: FEATURES },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByRole('heading', { level: 2, name: 'Benefits' })).toBeInTheDocument()
    await expect(canvas.getAllByRole('heading', { level: 3 })).toHaveLength(2)
  },
}

export const CardsBecomeH2WithoutASectionTitle: Story = {
  args: { features: FEATURES },
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
  args: { title: 'Benefits', features: FEATURES },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryAllByRole('link')).toHaveLength(0)
  },
}
