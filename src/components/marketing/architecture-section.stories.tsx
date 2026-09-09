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
