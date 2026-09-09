import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { NavMenuClient, type ResolvedNavGroup } from './nav-menu-client'

const meta = {
  title: 'Layout/NavMenu',
  component: NavMenuClient,
} satisfies Meta<typeof NavMenuClient>

export default meta
type Story = StoryObj<typeof meta>

const PRODUCTS: ResolvedNavGroup = {
  key: 'products',
  label: 'Products',
  sections: [
    {
      key: 'infrastructure',
      label: 'Infrastructure',
      links: [
        { key: 'liquidityHub', href: '/liquidity-hub/', external: false, label: 'Liquidity Hub', icon: 'liquidityHub' },
        { key: 'perpetualHub', href: '/perpetual-hub/', external: false, label: 'Perpetual Hub', icon: 'perpetualHub' },
      ],
    },
    {
      key: 'advancedTrading',
      label: 'Advanced Trading Tools',
      links: [{ key: 'dtwap', href: '/dtwap/', external: false, label: 'dTWAP Protocol', icon: 'dtwap' }],
    },
  ],
}

const RESOURCES: ResolvedNavGroup = {
  key: 'resources',
  label: 'Resources',
  sections: [
    // The designs open Resources with an unlabelled run before [TOOLS].
    { links: [{ key: 'blog', href: '/blog/', external: false, label: 'Blog' }] },
    {
      key: 'tools',
      label: 'Tools',
      links: [
        { key: 'tetraWallet', href: 'https://staking.orbs.network/', external: true, label: 'Tetra Wallet' },
      ],
    },
  ],
}

const TOP_LEVEL = [{ key: 'media', href: '/news/', external: false, label: 'Media' }]

const BASE = { groups: [PRODUCTS, RESOURCES], topLevel: TOP_LEVEL }

/** The panels are closed until asked for, so only triggers and top-level links show. */
export const ClosedByDefault: Story = {
  args: BASE,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByRole('button', { name: /Products/ })).toBeInTheDocument()
    await expect(canvas.getByRole('link', { name: 'Media' })).toHaveAttribute('href', '/news/')
    await expect(canvas.queryByRole('link', { name: 'Liquidity Hub' })).not.toBeInTheDocument()
  },
}

/**
 * The regression that matters most here. The previous menu was a CSS
 * `group-hover` panel, so it could not be opened by keyboard at all and every
 * dropdown destination was unreachable without a mouse.
 */
export const OpensFromTheKeyboard: Story = {
  args: BASE,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: /Products/ })

    trigger.focus()
    await userEvent.keyboard('{Enter}')

    await waitFor(async () => {
      await expect(canvas.getByRole('link', { name: 'Liquidity Hub' })).toBeInTheDocument()
    })
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  },
}

/**
 * `MenuItemW` composes the glyph and the label through Radix `Slottable`, so
 * the row must come out as ONE anchor containing both — not an anchor beside a
 * detached icon, and not a nested link.
 */
export const IconRowsAreASingleLink: Story = {
  args: BASE,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByRole('button', { name: /Products/ }))

    const link = await waitFor(() => canvas.getByRole('link', { name: 'Liquidity Hub' }))

    await expect(link).toHaveAttribute('href', '/liquidity-hub/')
    // The glyph is inside the anchor, and decorative — it must not add a name.
    await expect(link.querySelector('svg')).toBeTruthy()
    await expect(link.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    await expect(within(link).queryAllByRole('img')).toHaveLength(0)
  },
}

/** External entries open off-site with a safe rel; internal ones do not. */
export const ExternalRowsOpenSafely: Story = {
  args: BASE,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByRole('button', { name: /Resources/ }))

    const external = await waitFor(() => canvas.getByRole('link', { name: 'Tetra Wallet' }))
    await expect(external).toHaveAttribute('target', '_blank')
    await expect(external).toHaveAttribute('rel', 'noopener noreferrer')

    const internal = canvas.getByRole('link', { name: 'Blog' })
    await expect(internal).not.toHaveAttribute('target')
  },
}

/**
 * A section label is rendered with the design's brackets around it, and the
 * brackets come from the component rather than the catalog — a translator
 * supplies the word, not the punctuation.
 */
export const SectionLabelsAreBracketed: Story = {
  args: BASE,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByRole('button', { name: /Products/ }))

    await waitFor(async () => {
      await expect(canvas.getByRole('heading', { name: '[Infrastructure]' })).toBeInTheDocument()
    })
    await expect(canvas.getByRole('heading', { name: '[Advanced Trading Tools]' })).toBeInTheDocument()
  },
}

/** An unlabelled run renders its links with no heading above them. */
export const UnlabelledSectionHasNoHeading: Story = {
  args: BASE,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByRole('button', { name: /Resources/ }))

    await waitFor(async () => {
      await expect(canvas.getByRole('link', { name: 'Blog' })).toBeInTheDocument()
    })
    // Only [Tools] is labelled in this group.
    await expect(canvas.getAllByRole('heading')).toHaveLength(1)
  },
}
