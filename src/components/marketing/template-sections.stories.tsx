import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { Button } from '@/components/ui/button'
import { ClosingCta } from './closing-cta'
import { GraphicSplit } from './graphic-split'
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
const CONTACT = { label: 'Talk to the team', href: '/contact/' }

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
        pauseLabel="Pause"
        resumeLabel="Resume"
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

/** The signup the home page passes in renders above the phrases, as designed. */
export const ClosingChildrenSitAboveTheMarquee: Story = {
  render: () => (
    <ClosingCta
      phrases={['One API.']}
      pauseLabel="Pause"
      resumeLabel="Resume"
      locale="en"
      actions={<Button>Talk to the team</Button>}
    >
      <p data-testid="signup">Signup</p>
    </ClosingCta>
  ),
  play: async ({ canvasElement }) => {
    const signup = canvasElement.querySelector('[data-testid="signup"]') as HTMLElement
    const phrase = within(canvasElement).getAllByText('One API.')[0]

    await expect(signup.compareDocumentPosition(phrase) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  },
}
