import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { ArchitectureSection } from './architecture-section'

const meta = {
  title: 'Marketing/ArchitectureSection',
  component: ArchitectureSection,
} satisfies Meta<typeof ArchitectureSection>

export default meta
type Story = StoryObj<typeof meta>

const BASE = {
  title: 'Decentralized Execution of TWAP Orders',
  body: '**Makers** are DEX traders submitting orders.\n\n**Takers** are incentivized third parties.',
  image: '/marketing/dtwap/schema.png',
  imageWidth: 2235,
  imageHeight: 1328,
  imageAlt: '',
  /*
    English, so nothing here is marked. `textLang` only returns `'en'` for
    Latin text inside a NON-Latin document — in an English one there is
    nothing to distinguish it from, so every `lang` below resolves to
    `undefined`. `MixedLanguageSection` is the story that exercises the real
    behaviour.
  */
  locale: 'en' as const,
}

export const WithAllLinks: Story = {
  args: {
    ...BASE,
    links: [
      { label: 'read the white paper', href: '/white-papers/dTWAP/' },
      { label: 'PeckShield Security Audit', href: 'https://github.com/orbs-network/twap' },
      { label: 'FAQ', href: '/dtwap-and-dlimit-faq/' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getAllByRole('link')).toHaveLength(3)
  },
}

/**
 * The legacy Japanese and Korean pages have no FAQ link, expressed as an empty
 * label in their catalogs. An empty label must be dropped, not rendered as a
 * blank button.
 */
export const EmptyLabelIsSkipped: Story = {
  args: {
    ...BASE,
    links: [
      { label: 'read the white paper', href: '/white-papers/dTWAP/' },
      { label: '', href: '/dtwap-and-dlimit-faq/' },
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
    ...BASE,
    links: [{ label: '   ', href: '/dtwap-and-dlimit-faq/' }],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.queryAllByRole('link')).toHaveLength(0)
  },
}

/**
 * Internal links must render through next/link and keep their trailing slash;
 * external links open in a new tab with a safe rel.
 */
export const InternalAndExternalLinks: Story = {
  args: {
    ...BASE,
    links: [
      { label: 'FAQ', href: '/dtwap-and-dlimit-faq/' },
      { label: 'Audit', href: 'https://github.com/orbs-network/twap' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const internal = canvas.getByRole('link', { name: 'FAQ' })
    const external = canvas.getByRole('link', { name: 'Audit' })

    await expect(internal).toHaveAttribute('href', '/dtwap-and-dlimit-faq/')
    await expect(internal).not.toHaveAttribute('target')
    await expect(external).toHaveAttribute('target', '_blank')
    await expect(external).toHaveAttribute('rel', 'noopener noreferrer')
  },
}

/**
 * The bug #103 exists to remove, as a test.
 *
 * This is dSLTP's closing block, in Korean. "Powered by Orbs Network" is
 * English in the Korean catalog too — the legacy page leaves it that way —
 * while the prose and one of the two link labels beneath it are Korean.
 *
 * Under the old section-level `lang`, the page computed ONE value from one of
 * these strings and hung it on the wrapper. Derived from the title it marked
 * the Korean prose English; derived from the body it marked the English
 * heading Korean, so a screen reader read "Powered by Orbs Network" with
 * Korean pronunciation rules. A `titleLang` prop was added to patch the first
 * case, and the same fix was then needed in five more components.
 *
 * Every assertion below is a string that the single-value approach could not
 * get right at the same time as the others.
 */
export const MixedLanguageSection: Story = {
  name: 'Mixed languages are marked per string',
  args: {
    ...BASE,
    locale: 'ko' as const,
    eyebrow: 'POWERED BY',
    title: 'Powered by Orbs Network',
    body: 'dSLTP는 오브스 네트워크 위에서 실행됩니다.\n\n탈중앙화된 실행 계층입니다.',
    imageAlt: '',
    links: [
      { label: 'Orbs Docs', href: 'https://docs.orbs.network' },
      { label: '문의하기', href: '/contact/' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // English heading inside a Korean document: marked.
    await expect(canvas.getByRole('heading', { name: 'Powered by Orbs Network' })).toHaveAttribute('lang', 'en')
    // The eyebrow is its own string. It had no `lang` at all before this
    // change — it silently inherited whatever the section guessed.
    await expect(canvas.getByText('POWERED BY')).toHaveAttribute('lang', 'en')

    // Korean prose in the same section: NOT marked English.
    const paragraph = canvas.getByText(/오브스 네트워크/)
    await expect(paragraph).not.toHaveAttribute('lang', 'en')

    // Two links, two languages, one row.
    await expect(canvas.getByRole('link', { name: 'Orbs Docs' })).toHaveAttribute('lang', 'en')
    await expect(canvas.getByRole('link', { name: '문의하기' })).not.toHaveAttribute('lang', 'en')

    /*
      A decorative image carries no language. `imageAlt` is '' here, and
      `textLang('')` used to return 'en' — labelling the language of something
      with no text at all. See `src/i18n/script.test.ts`.
    */
    await expect(canvasElement.querySelector('img')).not.toHaveAttribute('lang')
  },
}
