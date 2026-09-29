import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { HERO_GRAPHICS } from '@/content/shared/hero-graphics'
import { PRODUCT_DEV_DOCS } from '@/content/shared/sdk'
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
  locale: 'en' as const,
}

export const WithImage: Story = {
  args: {
    ...BASE,
    image: '/marketing/dtwap/hero.svg',
    imageAlt: '',
    locale: 'en',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('heading', { level: 1 })).toBeInTheDocument()
    await expect(canvasElement.querySelectorAll('img')).toHaveLength(1)
  },
}

/**
 * The 3.x illustration: two files, one per theme, and only the one matching
 * the theme shows. Storybook renders the light theme, so the light file is the
 * visible one and the dark file is in the DOM but hidden.
 */
export const WithThemedGraphic: Story = {
  args: { ...BASE, graphic: HERO_GRAPHICS.dlimit },
  play: async ({ canvasElement }) => {
    const [dark, light] = canvasElement.querySelectorAll('img')

    await expect(canvasElement.querySelectorAll('img')).toHaveLength(2)
    await expect(dark.getAttribute('src')).toContain('hero.svg')
    await expect(dark).not.toBeVisible()
    await expect(light.getAttribute('src')).toContain('hero-light.svg')
    await expect(light).toBeVisible()
    // Decorative: the headline beside it carries the meaning.
    await expect(light).toHaveAttribute('alt', '')
  },
}

/**
 * Pages without an illustration must still render, and must not leave an
 * empty image column where the illustration would be.
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
    locale: 'en',
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

const DEV_LINK = { label: 'SDK', href: PRODUCT_DEV_DOCS.dtwap.href }

/**
 * The developer link sits in the call-to-action row, goes where it is given —
 * the product's own part of the docs — and opens safely in a new tab.
 */
export const DevLinkGoesToTheProductDocs: Story = {
  args: { ...BASE, devLink: DEV_LINK },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'SDK' })

    await expect(link).toHaveAttribute('href', 'https://docs.orbs.com/advanced-orders/shared')
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    await expect(link.parentElement).toBe(
      within(canvasElement).getByRole('link', { name: 'GET STARTED' }).parentElement
    )
  },
}

/** Only products with docs carry it: no link given, no link drawn. */
export const DevLinkIsOptIn: Story = {
  args: BASE,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('link', { name: /sdk|api|skill/i })).not.toBeInTheDocument()
  },
}

/** The label is English in every catalog, so a Korean page marks it. */
export const DevLinkIsMarkedEnglishInKorean: Story = {
  args: { ...BASE, headline: '탈중앙화 거래소', intro: '지정가 주문', locale: 'ko', devLink: DEV_LINK },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('link', { name: 'SDK' })).toHaveAttribute('lang', 'en')
  },
}
