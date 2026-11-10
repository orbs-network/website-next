import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { Button } from '@/components/ui/button'
import { ClosingCta } from './closing-cta'
import { GraphicSplit } from './graphic-split'
import { ModuleCards } from './module-cards'
import { CtaButton } from './section-parts'
import { SplitHero } from './split-hero'
import { SplitStatement } from './split-statement'
import { StatementBand } from './statement-band'

/**
 * The 3.4 section library — `MASTER / Dark Inner Page` in Figma — as used by
 * the SDK and Venues pages. One file because the sections are only ever seen
 * together, and the interesting failures are about how they sit on a page.
 *
 * The graphic is a stand-in: any existing SVG shows the layout.
 */
const meta = {
  title: 'Marketing/TemplateSections',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const GRAPHIC = {
  src: '/marketing/home/network-diagram.svg',
  lightSrc: '/marketing/home/network-diagram.svg',
  width: 1016,
  height: 622,
}
const DOCS = { label: 'Developer docs', href: 'https://docs.orbs.network/' }
const CONTACT = { label: 'Talk to the team', href: '/contact' }

export const Page: Story = {
  render: () => (
    <>
      <SplitHero
        eyebrow="[SDK / API]"
        headline="One API and SDK for spot and perpetuals"
        intro="Connect your application to Orbs’ multichain execution infrastructure, from liquidity aggregation and advanced spot orders to perpetual trading."
        cta={DOCS}
        graphic={GRAPHIC}
        locale="en"
      />
      <SplitStatement
        eyebrow="[INFRASTRUCTURE]"
        heading="Built on production infrastructure"
        body={
          'Access the same execution technology already powering trading across DEXs.\n\nA single API and SDK brings liquidity aggregation, advanced spot orders and perpetual trading together.'
        }
        locale="en"
      />
      <StatementBand text="Build, test and launch." locale="en" />
      <GraphicSplit
        eyebrow="[INTEGRATION]"
        heading="From testing to production"
        body="Developer documentation, a sandbox, uptime SLAs and named integration support help teams build, test and launch."
        cta={CONTACT}
        graphic={GRAPHIC}
        locale="en"
      />
      <ClosingCta
        phrases={['One API.', 'Spot and perpetuals.', 'Build, test and launch.']}
        locale="en"
        actions={<Button>Talk to the team</Button>}
      />
    </>
  ),
}

/**
 * One `<h1>` for the page, and it is the hero's. Every other section title is
 * an `<h2>` even though the design draws them at the same size — size is a
 * visual decision, level is a structural one.
 */
export const OneH1: Story = {
  ...Page,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvasElement.querySelectorAll('h1')).toHaveLength(1)
    await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent('One API and SDK')
    await expect(canvas.getAllByRole('heading', { level: 2 })).toHaveLength(2)
  },
}

/**
 * The hero reads text first, graphic second — the graphic moves left only by
 * CSS order on a wide screen. On a phone the headline is not pushed below a
 * screenful of illustration, and a screen reader never meets the image first.
 */
export const HeroCopyPrecedesGraphic: Story = {
  ...Page,
  play: async ({ canvasElement }) => {
    const hero = canvasElement.querySelector('section') as HTMLElement
    const heading = hero.querySelector('h1') as HTMLElement
    const image = hero.querySelector('img') as HTMLElement

    await expect(heading.compareDocumentPosition(image) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  },
}

/** Brand illustration, not information: every graphic image is `alt=""`. */
export const GraphicsAreDecorative: Story = {
  ...Page,
  play: async ({ canvasElement }) => {
    const images = [...canvasElement.querySelectorAll('img')]

    // Two graphics, each shipped as a dark and a light file.
    await expect(images).toHaveLength(4)
    for (const image of images) await expect(image.getAttribute('alt')).toBe('')
  },
}

/**
 * Exactly one variant of each graphic shows, and it is the one for the theme.
 *
 * The exports hard-code white dots and guide lines. Shown on the light theme
 * they disappear, which is how the legacy product pages ended up with art
 * that only works in one theme; this is the guard against repeating it.
 */
export const OneGraphicVariantPerTheme: Story = {
  ...Page,
  play: async ({ canvasElement }) => {
    const shown = () =>
      [...canvasElement.querySelectorAll('img')].filter((image) => getComputedStyle(image).display !== 'none')

    const html = document.documentElement
    const wasDark = html.classList.contains('dark')
    try {
      html.classList.remove('dark')
      await expect(shown()).toHaveLength(2)

      html.classList.add('dark')
      await expect(shown()).toHaveLength(2)
    } finally {
      html.classList.toggle('dark', wasDark)
    }
  },
}

/**
 * External destinations open in a new tab WITH `noopener`; internal ones stay
 * in the tab. `CtaButton` decides by the href, so no page can forget `rel`.
 */
export const ExternalLinksAreIsolated: Story = {
  ...Page,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const docs = canvas.getByRole('link', { name: /developer docs/i })
    await expect(docs.getAttribute('target')).toBe('_blank')
    await expect(docs.getAttribute('rel')).toContain('noopener')

    const contact = canvas.getByRole('link', { name: /talk to the team/i })
    await expect(contact.getAttribute('target')).toBeNull()
  },
}

/**
 * Internal destinations follow the page's locale. Callers pass `/contact`;
 * on a Korean page that has to land on `/ko/contact/`, not English.
 */
export const InternalLinksKeepTheLocale: Story = {
  render: () => (
    <GraphicSplit
      eyebrow="[통합]"
      heading="테스트에서 프로덕션까지"
      body="개발자 문서"
      cta={CONTACT}
      graphic={GRAPHIC}
      locale="ko"
    />
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: /talk to the team/i })
    await expect(link.getAttribute('href')).toBe('/ko/contact/')
  },
}

/**
 * Two authored paragraphs stay two paragraphs. The design's body copy has a
 * blank line between them, which a bare `<p>` would collapse.
 */
export const StatementKeepsItsParagraphs: Story = {
  ...Page,
  play: async ({ canvasElement }) => {
    const statement = canvasElement.querySelectorAll('section')[1] as HTMLElement

    await expect(statement.querySelectorAll('p')).toHaveLength(3) // eyebrow + two paragraphs
  },
}

/**
 * The band's text is dark in BOTH themes, because the band is light in both.
 * Following `text-fg` would turn it near-white on a pale lavender in dark mode.
 */
export const BandTextIsDarkInDarkMode: Story = {
  render: () => (
    <div className="dark">
      <StatementBand text="Your brand and user experience." locale="en" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    document.documentElement.classList.add('dark')
    try {
      const text = canvasElement.querySelector('section p') as HTMLElement
      await expect(getComputedStyle(text).color).toBe('rgb(18, 18, 20)')
    } finally {
      document.documentElement.classList.remove('dark')
    }
  },
}

const MODULES = (
  <ModuleCards
    id="modules"
    eyebrow="[dSPOT MODULES]"
    heading="Advanced orders and best-price liquidity in one execution stack."
    body="dSPOT combines advanced order types with Liquidity Hub."
    cards={[
      {
        id: 'dlimit',
        eyebrow: 'dLIMIT',
        accentClassName: 'text-indigo-400 dark:text-indigo-200',
        title: 'dLIMIT',
        body: 'Place orders at a target price or better.',
        link: { label: 'Discover dLIMIT', href: '/dlimit' },
      },
      {
        id: 'liquidityHub',
        eyebrow: 'Liquidity Hub',
        accentClassName: 'text-[#06737b] dark:text-cyan-400',
        title: 'Liquidity Hub',
        titleClassName: 'uppercase',
        body: 'Let DEXs tap external liquidity sources for better prices on swaps.',
        link: { label: 'Discover Liquidity Hub', href: '/liquidity-hub' },
      },
    ]}
    locale="en"
  />
)

/**
 * Each module card is headed by its product's name as plain text, and the
 * coloured name above it — the same word again — is hidden from assistive
 * technology. No glyph inside the heading (#211): the design draws none.
 */
export const ModuleCardsAreNamedOnce: Story = {
  render: () => MODULES,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const headings = canvas.getAllByRole('heading', { level: 3 })

    await expect(headings.map((h) => h.textContent)).toEqual(['dLIMIT', 'Liquidity Hub'])
    for (const heading of headings) await expect(heading.querySelector('svg')).toBeNull()
    for (const card of canvasElement.querySelectorAll('li')) {
      await expect(card.querySelector('p')?.getAttribute('aria-hidden')).toBe('true')
    }
  },
}

/** Cards link down to the product pages; the hero's anchor lands on the grid. */
export const ModuleCardsLinkDown: Story = {
  render: () => MODULES,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByRole('link', { name: /discover dlimit/i }).getAttribute('href')).toBe('/dlimit/')
    await expect(canvasElement.querySelector('section')?.id).toBe('modules')
  },
}

/**
 * The cards recess into the light page (#E7E7E7 on #F6F6F6) and take the
 * shared `card-fill` in dark (#231). The Discover link ends in the drawn line
 * arrow, not a typed `→` that renders as an 11px dash.
 */
export const ModuleCardFillFollowsTheTheme: Story = {
  render: () => MODULES,
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector('li') as HTMLElement

    await expect(getComputedStyle(card).backgroundColor).toBe('rgb(231, 231, 231)')
    await expect(card.querySelector('a svg')).not.toBeNull()

    document.documentElement.classList.add('dark')
    try {
      await expect(getComputedStyle(card).backgroundColor).toBe('rgb(30, 30, 32)')
    } finally {
      document.documentElement.classList.remove('dark')
    }
  },
}

/** An in-page anchor stays a fragment: `localeHref` would make it a path. */
export const AnchorCtaStaysOnPage: Story = {
  render: () => <CtaButton link={{ label: 'Discover order types', href: '#modules' }} locale="ko" />,
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link')

    await expect(link.getAttribute('href')).toBe('#modules')
    await expect(link.getAttribute('target')).toBeNull()
  },
}

/** dSPOT's numbered points are a real ordered list, after the body. */
export const StatementPointsAreAnOrderedList: Story = {
  render: () => (
    <SplitStatement
      eyebrow="[BEST EXECUTION]"
      heading="Built for best execution."
      body="Access additional liquidity routes."
      points={['Competitive pricing', 'Non-custodial by design', 'Onchain settlement']}
      locale="en"
    />
  ),
  play: async ({ canvasElement }) => {
    const items = within(canvasElement).getAllByRole('listitem')

    await expect(items).toHaveLength(3)
    await expect(items[0].closest('ol')).not.toBeNull()
  },
}

/**
 * Each number sits in the design's outlined octagon, in the accent colour
 * (#3346F2 on light), and is hidden because the `<ol>` already counts (#231).
 */
export const StatementPointsHaveOutlinedBadges: Story = {
  ...StatementPointsAreAnOrderedList,
  play: async ({ canvasElement }) => {
    const items = within(canvasElement).getAllByRole('listitem')

    for (const [index, item] of items.entries()) {
      const badge = item.querySelector(':scope > [aria-hidden="true"]') as HTMLElement
      await expect(badge.textContent).toBe(String(index + 1))
      await expect(badge.getBoundingClientRect().width).toBe(30)
      await expect(badge.querySelector('svg path')?.getAttribute('stroke')).toBe('currentColor')
      await expect(getComputedStyle(badge).color).toBe('rgb(51, 70, 242)')
    }
  },
}

/** The signup the home page passes in renders above the phrases, as designed. */
export const ClosingChildrenSitAboveTheMarquee: Story = {
  render: () => (
    <ClosingCta phrases={['One API.']} locale="en" actions={<Button>Talk to the team</Button>}>
      <p data-testid="signup">Signup</p>
    </ClosingCta>
  ),
  play: async ({ canvasElement }) => {
    const signup = canvasElement.querySelector('[data-testid="signup"]') as HTMLElement
    const phrase = within(canvasElement).getAllByText('One API.')[0]

    await expect(signup.compareDocumentPosition(phrase) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  },
}

/** Supplied glow, both themes; decoration extends upward without blocking actions. */
export const ClosingGlowArtwork: Story = {
  parameters: {
    viewport: {
      options: {
        desktop: { name: 'Figma width', styles: { width: '1612px', height: '900px' } },
        phone: { name: 'Phone', styles: { width: '320px', height: '900px' } },
      },
    },
  },
  globals: { viewport: { value: 'desktop' } },
  render: () => (
    <ClosingCta
      phrases={['One API.', 'Every on-chain order type.']}
      locale="en"
      actions={<Button>Talk to the team</Button>}
    />
  ),
  play: async ({ canvasElement }) => {
    const backdrop = canvasElement.querySelector<HTMLElement>('.closing-cta-glow')!
    const root = backdrop.parentElement!
    const html = document.documentElement
    const wasDark = html.classList.contains('dark')
    try {
      for (const dark of [false, true]) {
        html.classList.toggle('dark', dark)
        const background = getComputedStyle(backdrop).backgroundImage
        await expect(background).toContain(`closing-glow-${dark ? 'dark' : 'light'}.svg`)
        const image = new Image()
        image.src = background.slice(5, -2)
        await image.decode()
        await expect(image.naturalHeight).toBe(954)
        // Inspect the painted SVG, not just its filename: cyan at the left,
        // pink at the lower centre, and a transparent fade above the field.
        const canvas = document.createElement('canvas')
        canvas.width = 1612
        canvas.height = 954
        const context = canvas.getContext('2d')!
        context.drawImage(image, 0, 0, 1612, 954)
        const left = context.getImageData(400, 900, 1, 1).data
        const centre = context.getImageData(806, 900, 1, 1).data
        const top = context.getImageData(806, 20, 1, 1).data
        await expect(left[1]).toBeGreaterThan(left[0])
        await expect(centre[0]).toBeGreaterThan(centre[1])
        await expect(centre[2]).toBeGreaterThan(centre[1])
        await expect(centre[3]).toBeGreaterThan(top[3])
      }
      const field = backdrop.getBoundingClientRect()
      const section = root.getBoundingClientRect()
      await expect(Math.abs(field.bottom - section.bottom)).toBeLessThan(1)
      await expect(Math.abs(field.height - Math.max(section.height, (section.width * 954) / 1612))).toBeLessThan(1)
      await expect(backdrop).toHaveAttribute('aria-hidden', 'true')
      await expect(getComputedStyle(backdrop).pointerEvents).toBe('none')
      const button = within(canvasElement).getByRole('button', { name: 'Talk to the team' })
      button.focus()
      await expect(button).toHaveFocus()
      const box = button.getBoundingClientRect()
      await expect(
        document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)?.closest('button')
      ).toBe(button)
      await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth)
    } finally {
      html.classList.toggle('dark', wasDark)
    }
  },
}

export const ClosingGlowPhone: Story = {
  ...ClosingGlowArtwork,
  globals: { viewport: { value: 'phone' } },
}
