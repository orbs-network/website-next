import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { HOME_VENUES } from '@/content/pages/home'
import { LogoRow } from './logo-row'

const meta = {
  title: 'Marketing/LogoRow',
  component: LogoRow,
} satisfies Meta<typeof LogoRow>

export default meta
type Story = StoryObj<typeof meta>

const ITEMS = [
  { name: 'Ethereum', logo: { src: '/marketing/agentic/chains/ethereum.png', width: 250, height: 250 } },
  { name: 'Base', logo: { src: '/marketing/agentic/chains/base.png', width: 200, height: 200 } },
]

/**
 * The chain name is announced once, by the visible text. The logo beside it is
 * decorative — naming it too would give "Ethereum, Ethereum" for every chain.
 */
export const NamesAreAnnouncedOnce: Story = {
  args: { title: 'Chains', items: ITEMS, locale: 'en' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByText('Ethereum')).toBeInTheDocument()
    await expect(canvas.queryAllByRole('img')).toHaveLength(0)
    await expect(canvas.getAllByRole('listitem')).toHaveLength(2)
  },
}

/**
 * Chain names are proper nouns and stay Latin, so inside a Korean document
 * they are marked English.
 *
 * THE LOCALE MUST NOT BE ENGLISH — that is the story, not setup detail.
 * `textLang` returns 'en' only for Latin text inside a NON-Latin document; in
 * an English one there is nothing to distinguish Latin from, so it returns
 * `undefined` and no attribute is emitted.
 *
 * This assertion used to pass against a hardcoded `lang="en"` on the name, so
 * it held at any locale. Derived, running it at 'en' would find nothing.
 */
export const NamesAreMarkedEnglish: Story = {
  args: { title: '체인', items: ITEMS, locale: 'ko' },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('span[lang="en"]')).toBeTruthy()

    // ...and the Korean heading above them is not. One section-level `lang`
    // had to be wrong about one of these two.
    await expect(canvasElement.querySelector('h2')).not.toHaveAttribute('lang', 'en')
  },
}

/** Some rows are names only — the institutional venues carry no logos. */
export const LogosAreOptional: Story = {
  args: {
    title: 'Integrated by leading venues',
    items: [{ name: 'PancakeSwap' }, { name: 'SushiSwap' }],
    locale: 'en',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByText('PancakeSwap')).toBeInTheDocument()
    await expect(canvasElement.querySelectorAll('img')).toHaveLength(0)
  },
}

/**
 * Monochrome white wordmarks are inverted in the light theme — without it they
 * are white on a near-white background. Opt-in, because full-colour brand marks
 * must not be inverted.
 */
export const WhiteMarksInvertInLightTheme: Story = {
  args: {
    locale: 'en',
    title: 'Works with existing security infrastructure',
    items: [
      {
        name: 'Ledger',
        logo: { src: '/marketing/institutional/infra-ledger.svg', width: 160, height: 54 },
        invertOnLight: true,
      },
    ],
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('img')).toHaveClass('invert')
    await expect(canvasElement.querySelector('img')).toHaveClass('dark:invert-0')
  },
}

/**
 * A mark with a light-background twin shows exactly one of the two per theme,
 * by computed display rather than by class name — the venue row once shipped
 * white marks only and half of them vanished on the light theme (#220).
 */
export const ThemePairShowsOneMarkPerTheme: Story = {
  args: {
    locale: 'en',
    title: 'Venues',
    items: [
      {
        name: 'THENA',
        logo: {
          src: '/marketing/home/venues/thena.svg',
          onLight: '/marketing/home/venues/thena-on-light.svg',
          width: 129,
          height: 30,
        },
        wordmark: true,
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const shown = () =>
      [...canvasElement.querySelectorAll('img')]
        .filter((img) => getComputedStyle(img).display !== 'none')
        .map((img) => img.getAttribute('src') ?? '')

    const html = document.documentElement
    const wasDark = html.classList.contains('dark')
    try {
      html.classList.remove('dark')
      const light = shown()
      await expect(light).toHaveLength(1)
      await expect(light[0]).toContain('thena-on-light.svg')

      html.classList.add('dark')
      const dark = shown()
      await expect(dark).toHaveLength(1)
      await expect(dark[0]).not.toContain('on-light')
    } finally {
      html.classList.toggle('dark', wasDark)
    }
  },
}

/**
 * The home venue strip, `spread`, at the narrowest `lg` width. Six marks need
 * about 1030px with their gaps and the column is 958 here, so the row has to
 * keep wrapping — forcing one line at `lg` scrolled the page sideways (#247).
 */
export const SpreadRowStillWrapsAt1024: Story = {
  parameters: {
    viewport: { options: { desktop1024: { name: 'Desktop 1024', styles: { width: '1024px', height: '800px' } } } },
  },
  globals: { viewport: { value: 'desktop1024' } },
  args: { title: 'Venues running on the stack', titleHidden: true, spread: true, items: HOME_VENUES, locale: 'en' },
  play: async () => {
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth)
  },
}
