import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { FOOTER_SOCIALS } from '@/content/shared/footer'
import { FooterSocials } from './footer-socials'

const meta = {
  title: 'Layout/FooterSocials',
  component: FooterSocials,
} satisfies Meta<typeof FooterSocials>

export default meta
type Story = StoryObj<typeof meta>

const LABELS = {
  github: 'GitHub',
  x: 'X',
  telegram: 'Telegram',
  discord: 'Discord',
  youtube: 'YouTube',
  snapshot: 'Snapshot',
}

export const Default: Story = {
  args: { labels: LABELS },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getAllByRole('link')).toHaveLength(FOOTER_SOCIALS.length)
  },
}

/**
 * The only visible content is an SVG, so without the catalog label each link
 * would announce as unlabelled. The icon components carry their own
 * `role="img"` and `aria-label`, which is why they are hidden here — otherwise
 * two names compete for one link.
 */
export const EveryLinkHasOneAccessibleName: Story = {
  args: { labels: LABELS },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    for (const social of FOOTER_SOCIALS) {
      const link = canvas.getByRole('link', { name: LABELS[social.key as keyof typeof LABELS] })
      await expect(link).toHaveAttribute('href', social.href)
    }

    // The glyphs are decorative here, so none of them expose an image role.
    await expect(canvas.queryAllByRole('img')).toHaveLength(0)
  },
}

/** Every social link leaves the site, so all of them need the safe rel. */
export const AllLinksOpenSafelyInANewTab: Story = {
  args: { labels: LABELS },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    for (const link of canvas.getAllByRole('link')) {
      await expect(link).toHaveAttribute('target', '_blank')
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    }
  },
}
