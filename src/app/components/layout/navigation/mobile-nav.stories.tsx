import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { FOOTER_EMAIL, FOOTER_SOCIALS } from '@/content/shared/footer'
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
  links: [
    { key: 'sdk', href: '/sdk/', external: false, label: 'Execution SDK/API' },
    {
      key: 'dspot',
      href: '/dspot/',
      external: false,
      label: 'dSPOT',
      icon: 'dspot',
      children: [{ key: 'dtwap', href: '/dtwap/', external: false, label: 'dTWAP' }],
    },
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
    { key: 'blog', href: '/blog/', external: false, label: 'Blog' },
    { key: 'docs', href: 'https://docs.orbs.network/', external: true, label: 'Docs', desktopOnly: true as const },
  ],
  locale: 'en' as const,
  label: 'Open menu',
  title: 'Menu',
  closeLabel: 'Close',
  cta: { label: 'Talk to the team', href: '/contact/' },
  footer: {
    status: { label: 'Network status', good: 'good', degraded: 'degraded' },
    contactLabel: 'Contact',
    socialLabels: Object.fromEntries(FOOTER_SOCIALS.map((social) => [social.key, social.key])),
  },
}

async function openPanel(canvasElement: HTMLElement) {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open menu' }))
  return waitFor(() => within(document.body).getByRole('dialog'))
}

/** Nothing is in the DOM until asked for — the trigger is the only control. */
export const ClosedByDefault: Story = {
  args: BASE,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByRole('button', { name: 'Open menu' })).toBeInTheDocument()
    await expect(canvas.queryByRole('link', { name: 'dSPOT' })).not.toBeInTheDocument()
  },
}

/**
 * The design's first screen: one row per group, the plain links, and the call
 * to action. A group's links stay folded until its row is pressed.
 */
export const GroupsStartFolded: Story = {
  args: BASE,
  play: async ({ canvasElement }) => {
    const panel = within(await openPanel(canvasElement))

    const products = panel.getByRole('button', { name: 'Products' })
    await expect(products).toHaveAttribute('aria-expanded', 'false')
    await expect(panel.queryByRole('link', { name: 'dSPOT' })).not.toBeInTheDocument()

    await expect(panel.getByRole('link', { name: 'Blog' })).toBeInTheDocument()
    await expect(panel.getByRole('link', { name: /Talk to the team/ })).toHaveAttribute('href', '/contact/')
  },
}

/** A group row is a disclosure: it says what it controls, and opens it in place. */
export const GroupRowDisclosesItsLinks: Story = {
  args: BASE,
  play: async ({ canvasElement }) => {
    const panel = within(await openPanel(canvasElement))
    const products = panel.getByRole('button', { name: 'Products' })

    await userEvent.click(products)

    await expect(products).toHaveAttribute('aria-expanded', 'true')
    const controlled = document.getElementById(products.getAttribute('aria-controls') ?? '')
    await expect(controlled).not.toBeNull()
    await expect(within(controlled as HTMLElement).getByRole('link', { name: 'dSPOT' })).toBeVisible()
    // Only the one pressed.
    await expect(panel.getByRole('button', { name: 'Network' })).toHaveAttribute('aria-expanded', 'false')
  },
}

/** dSPOT's order types are a list nested under dSPOT, not siblings of it. */
export const OrderTypesNestUnderDspot: Story = {
  args: BASE,
  play: async ({ canvasElement }) => {
    const panel = within(await openPanel(canvasElement))
    await userEvent.click(panel.getByRole('button', { name: 'Products' }))

    const dspot = panel.getByRole('link', { name: 'dSPOT' })
    const dtwap = panel.getByRole('link', { name: 'dTWAP' })
    await expect(dspot.closest('li')?.contains(dtwap)).toBe(true)
  },
}

/**
 * Docs and GitHub are in the Network list, so the mobile design leaves them
 * out of its top level. The desktop bar still repeats them.
 */
export const DesktopOnlyLinksAreLeftOut: Story = {
  args: BASE,
  play: async ({ canvasElement }) => {
    const panel = within(await openPanel(canvasElement))

    await expect(panel.queryByRole('link', { name: 'Docs' })).not.toBeInTheDocument()
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
    const dialog = await openPanel(canvasElement)
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
    await openPanel(canvasElement)

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
    const panel = within(await openPanel(canvasElement))
    await userEvent.click(panel.getByRole('button', { name: 'Network' }))

    const external = panel.getByRole('link', { name: 'Status' })
    await expect(external).toHaveAttribute('target', '_blank')
    await expect(external).toHaveAttribute('rel', 'noopener noreferrer')
  },
}

/** The visible `[Menu]` names the dialog, without its brackets. */
export const PanelIsNamed: Story = {
  args: BASE,
  play: async ({ canvasElement }) => {
    await openPanel(canvasElement)

    await expect(within(document.body).getByRole('dialog', { name: 'Menu' })).toBeInTheDocument()
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
    const trigger = within(canvasElement).getByRole('button', { name: 'Open menu' })
    await expect(trigger).toHaveAttribute('lang', 'en')

    const dialog = await openPanel(canvasElement)

    // Korean close label is genuinely Korean, so it carries no override.
    await expect(within(dialog).getByText('닫기')).not.toHaveAttribute('lang')
  },
}

/** The close control is named from the catalog, not shadcn's hardcoded English. */
export const CloseControlIsTranslated: Story = {
  args: { ...BASE, locale: 'ko', closeLabel: '닫기' },
  play: async ({ canvasElement }) => {
    const dialog = await openPanel(canvasElement)

    await expect(within(dialog).getByRole('button', { name: '닫기' })).toBeInTheDocument()
    await expect(within(dialog).queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
  },
}

/**
 * The design's footer area under the call to action: the contact address as a
 * `mailto:` link, and one named, safely-opened link per social account.
 */
export const FooterAreaReachesContactAndSocials: Story = {
  args: BASE,
  play: async ({ canvasElement }) => {
    const panel = within(await openPanel(canvasElement))

    await expect(panel.getByRole('link', { name: FOOTER_EMAIL })).toHaveAttribute('href', `mailto:${FOOTER_EMAIL}`)
    await expect(panel.getByRole('link', { name: FOOTER_EMAIL })).toHaveAttribute('lang', 'en')
    for (const social of FOOTER_SOCIALS) {
      const link = panel.getByRole('link', { name: social.key })
      await expect(link).toHaveAttribute('href', social.href)
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    }
  },
}

/**
 * No reading, no band. The status service is unreachable here, so the
 * indicator renders nothing — and its band must collapse with it rather than
 * leave an empty strip between two rules.
 */
export const UnreadableStatusLeavesNoBand: Story = {
  args: BASE,
  play: async ({ canvasElement }) => {
    const panel = within(await openPanel(canvasElement))
    const email = panel.getByRole('link', { name: FOOTER_EMAIL })
    const band = email.parentElement?.previousElementSibling as HTMLElement

    await expect(panel.queryByRole('link', { name: /network status/i })).not.toBeInTheDocument()
    await expect(getComputedStyle(band).display).toBe('none')
  },
}

/** A reading arrives, the band shows it, linked to the status page. */
export const ReadableStatusShows: Story = {
  args: BASE,
  beforeEach: () => {
    const original = window.fetch
    window.fetch = async (input, init) =>
      String(input).includes('/api/network-status')
        ? new Response(JSON.stringify({ status: 'good' }))
        : original(input, init)
    return () => {
      window.fetch = original
    }
  },
  play: async ({ canvasElement }) => {
    const panel = within(await openPanel(canvasElement))
    const status = await panel.findByRole('link', { name: 'Network status: good' })

    await expect(status).toHaveAttribute('href', 'https://status.orbs.network/')
  },
}
