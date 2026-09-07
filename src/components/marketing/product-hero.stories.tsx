import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { ProductHero } from './product-hero'

const meta = {
  title: 'Marketing/ProductHero',
  component: ProductHero,
} satisfies Meta<typeof ProductHero>

export default meta
type Story = StoryObj<typeof meta>

const BASE = {
  headline: 'LIMIT ORDERS PROTOCOL FOR\nDECENTRALIZED EXCHANGES',
  intro: 'A decentralized on-chain protocol for price-efficient and reliable execution of limit orders.',
  ctaLabel: 'GET STARTED',
  ctaHref: '#get-started',
}

export const WithImage: Story = {
  args: {
    ...BASE,
    image: '/marketing/dtwap/hero.svg',
    imageAlt: '',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('heading', { level: 1 })).toBeInTheDocument()
    await expect(canvasElement.querySelectorAll('img')).toHaveLength(1)
  },
}

/**
 * dLIMIT ships without one: the asset its legacy page points at has never
 * existed. The section must still render, and must not leave an empty image
 * column where the illustration would be.
 */
export const WithoutImage: Story = {
  args: BASE,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByRole('heading', { level: 1 })).toBeInTheDocument()
    await expect(canvasElement.querySelectorAll('img')).toHaveLength(0)
  },
}

/**
 * The headline's line breaks are authored, not incidental — the legacy content
 * wrote it as separate markdown H1 lines and each language splits the phrase
 * differently, so they must survive rather than collapse to a single run.
 */
export const HeadlineKeepsAuthoredLineBreaks: Story = {
  args: BASE,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const heading = canvas.getByRole('heading', { level: 1 })

    await expect(heading).toHaveTextContent('LIMIT ORDERS PROTOCOL FOR')
    await expect(heading).toHaveTextContent('DECENTRALIZED EXCHANGES')
    await expect(heading.textContent).toContain('\n')
  },
}

/**
 * Both source links are optional and open off-site. The icons inside them are
 * hidden, so each link exposes exactly one accessible name — the regression #84
 * fixed.
 */
export const SourceLinksAreLabelledOnce: Story = {
  args: {
    ...BASE,
    repo: 'https://github.com/orbs-network/twap',
    telegram: 'https://t.me/dTWAPSupportGroup',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const repo = canvas.getByRole('link', { name: 'GitHub repository' })
    await expect(repo).toHaveAttribute('target', '_blank')
    await expect(repo).toHaveAttribute('rel', 'noopener noreferrer')

    await expect(canvas.getByRole('link', { name: 'Telegram support group' })).toBeInTheDocument()
    // The glyphs are decorative, so neither exposes an image role of its own.
    await expect(canvas.queryAllByRole('img')).toHaveLength(0)
  },
}

/** Neither link renders when the product has no public repo or support group. */
export const SourceLinksAreOptional: Story = {
  args: BASE,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getAllByRole('link')).toHaveLength(1)
  },
}
