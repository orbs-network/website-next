import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import type { FooterLinkSpec } from '@/content/shared/footer'
import { FooterNavColumn } from './footer-nav'

const meta = {
  title: 'Layout/FooterNavColumn',
  component: FooterNavColumn,
} satisfies Meta<typeof FooterNavColumn>

export default meta
type Story = StoryObj<typeof meta>

const spec = (key: string, href: string, localeHref?: FooterLinkSpec['localeHref']): FooterLinkSpec => ({
  key,
  href,
  ...(localeHref ? { localeHref } : {}),
})

/**
 * Internal paths pick up the trailing slash `trailingSlash: true` requires, and
 * stay in-document. External ones open in a new tab with a safe `rel`.
 */
export const InternalAndExternalLinks: Story = {
  args: {
    id: 'footer-resources',
    title: 'Resources',
    locale: 'en',
    items: [
      { spec: spec('faq', '/faq'), label: 'FAQ' },
      { spec: spec('developers', 'https://docs.orbs.network/'), label: 'Developers' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const internal = canvas.getByRole('link', { name: 'FAQ' })
    const external = canvas.getByRole('link', { name: 'Developers' })

    await expect(internal).toHaveAttribute('href', '/faq/')
    await expect(internal).not.toHaveAttribute('target')

    await expect(external).toHaveAttribute('href', 'https://docs.orbs.network/')
    await expect(external).toHaveAttribute('target', '_blank')
    await expect(external).toHaveAttribute('rel', 'noopener noreferrer')
  },
}

/**
 * The column heading names the `<nav>`, so assistive tech can tell four sibling
 * navigation landmarks apart instead of announcing "navigation" four times.
 */
export const HeadingLabelsTheLandmark: Story = {
  args: {
    id: 'footer-community',
    title: 'Community',
    locale: 'en',
    items: [{ spec: spec('contact', '/contact'), label: 'Contact' }],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('navigation', { name: 'Community' })).toBeInTheDocument()
  },
}

/**
 * A locale whose page is a real translation gets the localised URL. `/dtwap` is
 * in the availability map as Korean-translated, so it prefixes.
 */
export const TranslatedPagePrefixesTheLocale: Story = {
  args: {
    id: 'footer-powered-by',
    title: 'Powered by Orbs',
    locale: 'ko',
    items: [{ spec: spec('dtwap', '/dtwap'), label: 'dTWAP 프로토콜' }],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('link', { name: 'dTWAP 프로토콜' })).toHaveAttribute('href', '/ko/dtwap/')
  },
}

/**
 * A page with no Korean version falls back to the English URL rather than
 * minting `/ko/pos/`, which would be a second URL serving the same English page.
 * Most of the footer is in this state until Phase 3 lands the pages.
 */
export const UntranslatedPageFallsBackToEnglishUrl: Story = {
  args: {
    id: 'footer-overview',
    title: 'Overview',
    locale: 'ko',
    items: [{ spec: spec('proofOfStake', '/pos'), label: '지분증명(PoS V3)' }],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('link', { name: '지분증명(PoS V3)' })).toHaveAttribute('href', '/pos/')
  },
}

/**
 * There is no Japanese blog on this site, so the legacy Japanese footer links
 * the community Medium publication instead. The override wins over `localeHref`
 * and the link becomes external even though the entry it overrides is internal.
 */
export const LocaleOverrideSendsTheBlogOffSite: Story = {
  args: {
    id: 'footer-community',
    title: 'Community',
    locale: 'ja',
    items: [
      {
        spec: spec('blog', '/blog', {
          ja: 'https://orbs-japan-community.medium.com/',
          ko: 'https://orbskorea.medium.com/',
        }),
        label: 'Blog',
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const link = canvas.getByRole('link', { name: 'Blog' })

    await expect(link).toHaveAttribute('href', 'https://orbs-japan-community.medium.com/')
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  },
}

/** English stays internal — the override is per-locale, not a replacement. */
export const EnglishBlogStaysOnSite: Story = {
  args: {
    id: 'footer-community',
    title: 'Community',
    locale: 'en',
    items: [
      {
        spec: spec('blog', '/blog', { ja: 'https://orbs-japan-community.medium.com/' }),
        label: 'Blog',
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const link = canvas.getByRole('link', { name: 'Blog' })

    await expect(link).toHaveAttribute('href', '/blog/')
    await expect(link).not.toHaveAttribute('target')
  },
}

/**
 * An empty label means this locale's footer omits the link — the Japanese
 * footer has no accessibility declaration. It must not render as a blank link.
 */
export const EmptyLabelIsSkipped: Story = {
  args: {
    id: 'footer-overview',
    title: 'Overview',
    locale: 'ja',
    items: [
      { spec: spec('faq', '/faq'), label: 'FAQ' },
      { spec: spec('accessibility', '/accessibility-declaration'), label: '' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getAllByRole('link')).toHaveLength(1)
  },
}

/** Whitespace-only labels count as empty too. */
export const WhitespaceLabelIsSkipped: Story = {
  args: {
    id: 'footer-overview',
    title: 'Overview',
    locale: 'ja',
    items: [{ spec: spec('accessibility', '/accessibility-declaration'), label: '   ' }],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.queryAllByRole('link')).toHaveLength(0)
  },
}

/**
 * Korean chrome is a genuine mix: translated labels alongside brand nouns the
 * legacy site left in English. The English ones are marked `lang="en"` so a
 * screen reader does not read "Tetra" with Korean pronunciation rules.
 */
export const LatinLabelsAreMarkedEnglishInKorean: Story = {
  args: {
    id: 'footer-resources',
    title: 'Resources',
    locale: 'ko',
    items: [
      { spec: spec('tetra', 'https://staking.orbs.network/'), label: 'Tetra' },
      { spec: spec('contact', '/contact'), label: '문의하기' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByRole('link', { name: 'Tetra' })).toHaveAttribute('lang', 'en')
    await expect(canvas.getByRole('link', { name: '문의하기' })).not.toHaveAttribute('lang')
  },
}
