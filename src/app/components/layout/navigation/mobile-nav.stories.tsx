import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { MobileNav } from './mobile-nav'
import type { ResolvedNavGroup } from './nav-menu-client'

const meta = {
  title: 'Layout/MobileNav',
  component: MobileNav,
} satisfies Meta<typeof MobileNav>

export default meta
type Story = StoryObj<typeof meta>

const PRODUCTS: ResolvedNavGroup = {
  key: 'products',
  label: 'Products',
  sections: [
    {
      key: 'infrastructure',
      label: 'Infrastructure',
      links: [{ key: 'liquidityHub', href: '/liquidity-hub/', external: false, label: 'Liquidity Hub' }],
    },
  ],
}

const RESOURCES: ResolvedNavGroup = {
  key: 'resources',
  label: 'Resources',
  sections: [
    { links: [{ key: 'blog', href: '/blog/', external: false, label: 'Blog' }] },
    {
      key: 'tools',
      label: 'Tools',
      links: [{ key: 'tetraWallet', href: 'https://staking.orbs.network/', external: true, label: 'Tetra Wallet' }],
    },
  ],
}

const BASE = {
  groups: [PRODUCTS, RESOURCES],
  topLevel: [{ key: 'media', href: '/news/', external: false, label: 'Media' }],
  locale: 'en' as const,
  label: 'Open menu',
  title: 'Menu',
  closeLabel: 'Close',
}

/** Nothing is in the DOM until asked for — the trigger is the only control. */
export const ClosedByDefault: Story = {
  args: BASE,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByRole('button', { name: 'Open menu' })).toBeInTheDocument()
    await expect(canvas.queryByRole('link', { name: 'Liquidity Hub' })).not.toBeInTheDocument()
  },
}

/**
 * Groups render OPEN rather than as accordions, matching the legacy mobile
 * menu — with twelve links there is no reason to make someone tap twice to see
 * a destination.
 */
export const OpensWithEveryGroupExpanded: Story = {
  args: BASE,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open menu' }))

    // The panel portals out of the canvas, so query the document.
    const dialog = await waitFor(() => within(document.body).getByRole('dialog'))
    const panel = within(dialog)

    await expect(panel.getByRole('link', { name: 'Liquidity Hub' })).toBeInTheDocument()
    await expect(panel.getByRole('link', { name: 'Blog' })).toBeInTheDocument()
    await expect(panel.getByRole('link', { name: 'Tetra Wallet' })).toBeInTheDocument()
    await expect(panel.getByRole('link', { name: 'Media' })).toBeInTheDocument()
  },
}

/** The dialog carries an accessible name even though its title is visually hidden. */
export const PanelIsNamed: Story = {
  args: BASE,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open menu' }))
    await waitFor(async () => {
      await expect(within(document.body).getByRole('dialog', { name: 'Menu' })).toBeInTheDocument()
    })
  },
}

/**
 * Following a link must close the panel. An internal link is a client-side
 * transition, so without this the route changes underneath a panel that still
 * covers it.
 */
export const ClosesWhenALinkIsFollowed: Story = {
  args: BASE,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open menu' }))

    const dialog = await waitFor(() => within(document.body).getByRole('dialog'))
    await userEvent.click(within(dialog).getByRole('link', { name: 'Blog' }))

    await waitFor(async () => {
      await expect(within(document.body).queryByRole('dialog')).not.toBeInTheDocument()
    })
  },
}

/** Escape closes it — the reason this is a Radix dialog rather than a div. */
export const ClosesOnEscape: Story = {
  args: BASE,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open menu' }))
    await waitFor(() => within(document.body).getByRole('dialog'))

    await userEvent.keyboard('{Escape}')

    await waitFor(async () => {
      await expect(within(document.body).queryByRole('dialog')).not.toBeInTheDocument()
    })
  },
}

/** External rows still open off-site safely. */
export const ExternalRowsOpenSafely: Story = {
  args: BASE,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open menu' }))

    const dialog = await waitFor(() => within(document.body).getByRole('dialog'))
    const external = within(dialog).getByRole('link', { name: 'Tetra Wallet' })

    await expect(external).toHaveAttribute('target', '_blank')
    await expect(external).toHaveAttribute('rel', 'noopener noreferrer')
  },
}

/**
 * The trigger, panel title and close control take the same per-string `lang`
 * treatment as the menu rows. Korean translates the close control but leaves
 * "Open menu" in English, so only one of them is marked — a blanket document
 * `lang` would have a screen reader read the English one with Korean rules.
 */
export const LabelsCarryPerStringLang: Story = {
  args: { ...BASE, locale: 'ko', label: 'Open menu', closeLabel: '닫기' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: 'Open menu' })

    await expect(trigger).toHaveAttribute('lang', 'en')

    await userEvent.click(trigger)
    const dialog = await waitFor(() => within(document.body).getByRole('dialog'))

    // Korean close label is genuinely Korean, so it carries no override.
    await expect(within(dialog).getByText('닫기')).not.toHaveAttribute('lang')
  },
}

/** The close control is named from the catalog, not shadcn's hardcoded English. */
export const CloseControlIsTranslated: Story = {
  args: { ...BASE, locale: 'ko', closeLabel: '닫기' },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open menu' }))

    const dialog = await waitFor(() => within(document.body).getByRole('dialog'))
    await expect(within(dialog).getByRole('button', { name: '닫기' })).toBeInTheDocument()
    await expect(within(dialog).queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
  },
}
