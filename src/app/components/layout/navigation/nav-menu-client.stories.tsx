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
  links: [
    { key: 'sdk', href: 'https://docs.orbs.com/', external: true, label: 'Execution SDK/API' },
    {
      key: 'dspot',
      href: '/dspot/',
      external: false,
      label: 'dSPOT',
      icon: 'dspot',
      children: [
        { key: 'dtwap', href: '/dtwap/', external: false, label: 'dTWAP' },
        { key: 'liquidityHub', href: '/liquidity-hub/', external: false, label: 'Liquidity Hub' },
      ],
    },
    { key: 'dperps', href: '/dperps/', external: false, label: 'dPERPS', icon: 'perpetualHub' },
  ],
}

const NETWORK: ResolvedNavGroup = {
  key: 'network',
  label: 'Network',
  links: [
    { key: 'pos', href: '/pos/', external: false, label: 'Proof of Stake & Staking' },
    { key: 'status', href: 'https://status.orbs.network/', external: true, label: 'Status' },
  ],
}

const BASE = {
  groups: [PRODUCTS, NETWORK],
  topLevel: [
    { key: 'ecosystem', href: '/ecosystem/', external: false, label: 'Ecosystem' },
    {
      key: 'github',
      href: 'https://github.com/orbs-network',
      external: true,
      label: 'GitHub',
      desktopOnly: true as const,
    },
  ],
  featured: { title: 'Introducing dSPOT', href: '/introducing-dspot/', image: null },
  featuredCopy: { label: 'Featured Post', cta: 'Learn More' },
}

async function openGroup(canvasElement: HTMLElement, name: RegExp) {
  const canvas = within(canvasElement)
  await userEvent.click(canvas.getByRole('button', { name }))
  return canvas
}

export const ClosedByDefault: Story = {
  args: BASE,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByRole('button', { name: /Products/ })).toBeInTheDocument()
    await expect(canvas.getByRole('link', { name: 'Ecosystem' })).toHaveAttribute('href', '/ecosystem/')
    await expect(canvas.queryByRole('link', { name: 'dSPOT' })).not.toBeInTheDocument()
  },
}

export const OpensFromTheKeyboard: Story = {
  args: BASE,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: /Products/ })

    trigger.focus()
    await userEvent.keyboard('{Enter}')

    await waitFor(async () => {
      await expect(canvas.getByRole('link', { name: 'dSPOT' })).toBeInTheDocument()
    })
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  },
}

export const IconRowsAreASingleLink: Story = {
  args: BASE,
  play: async ({ canvasElement }) => {
    const canvas = await openGroup(canvasElement, /Products/)

    const link = await waitFor(() => canvas.getByRole('link', { name: 'dSPOT' }))

    await expect(link).toHaveAttribute('href', '/dspot/')
    // The glyph is inside the anchor, and decorative — it must not add a name.
    await expect(link.querySelector('svg')).toBeTruthy()
    await expect(link.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    await expect(within(link).queryAllByRole('img')).toHaveLength(0)
  },
}

/**
 * A row with no mark yet keeps the mark's column when its neighbours have one,
 * so every label in the list starts at the same x. Where no row has a mark
 * there is no column to keep.
 */
export const LabelsAlignWithOrWithoutAMark: Story = {
  args: BASE,
  play: async ({ canvasElement }) => {
    const canvas = await openGroup(canvasElement, /Products/)

    const labelX = (name: string) =>
      (canvas.getByRole('link', { name }).lastElementChild as HTMLElement).getBoundingClientRect().left
    await waitFor(() => canvas.getByRole('link', { name: 'Execution SDK/API' }))
    await expect(labelX('Execution SDK/API')).toBe(labelX('dSPOT'))
  },
}

/** dSPOT's order types are a list nested under dSPOT, indented past its label. */
export const OrderTypesNestUnderDspot: Story = {
  args: BASE,
  play: async ({ canvasElement }) => {
    const canvas = await openGroup(canvasElement, /Products/)

    const dspot = await waitFor(() => canvas.getByRole('link', { name: 'dSPOT' }))
    const dtwap = canvas.getByRole('link', { name: 'dTWAP' })

    await expect(dspot.closest('li')?.contains(dtwap)).toBe(true)
    await expect(dtwap.getBoundingClientRect().left).toBeGreaterThan(dspot.getBoundingClientRect().left)
  },
}

export const ExternalRowsOpenSafely: Story = {
  args: BASE,
  play: async ({ canvasElement }) => {
    const canvas = await openGroup(canvasElement, /Network/)

    const external = await waitFor(() => canvas.getByRole('link', { name: 'Status' }))
    await expect(external).toHaveAttribute('target', '_blank')
    await expect(external).toHaveAttribute('rel', 'noopener noreferrer')

    await expect(canvas.getByRole('link', { name: 'Proof of Stake & Staking' })).not.toHaveAttribute('target')
    // Top-level external links too.
    await expect(canvas.getByRole('link', { name: 'GitHub' })).toHaveAttribute('rel', 'noopener noreferrer')
  },
}

/**
 * The featured post is ONE link named by its title. "Learn More" looks like a
 * button but is part of the same link and hidden from assistive technology —
 * three tab stops to one destination, one of them named "Learn More", is what
 * it replaces.
 */
export const FeaturedPostIsOneLinkNamedByItsTitle: Story = {
  args: BASE,
  play: async ({ canvasElement }) => {
    const canvas = await openGroup(canvasElement, /Products/)

    const post = await waitFor(() => canvas.getByRole('link', { name: 'Introducing dSPOT' }))
    await expect(post).toHaveAttribute('href', '/introducing-dspot/')
    await expect(within(post).getByText('Learn More').closest('[aria-hidden="true"]')).not.toBeNull()
    await expect(canvas.queryByRole('link', { name: /Learn More/ })).not.toBeInTheDocument()
    await expect(post.querySelector('img')?.getAttribute('alt')).toBe('')
  },
}

/** No post — a degraded build, an empty space — means no column, not an empty one. */
export const NoFeaturedPostNoColumn: Story = {
  args: { ...BASE, featured: null },
  play: async ({ canvasElement }) => {
    const canvas = await openGroup(canvasElement, /Products/)

    await waitFor(() => canvas.getByRole('link', { name: 'dSPOT' }))
    await expect(canvas.queryByText('Featured Post')).not.toBeInTheDocument()
  },
}
