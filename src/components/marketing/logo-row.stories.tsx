import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, waitFor, within } from 'storybook/test'
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
 * A `spread` row of six venue marks at the narrowest `lg` width. Six marks need
 * about 1030px with their gaps and the column is 958 here, so the row has to
 * keep wrapping — forcing one line at `lg` scrolled the page sideways (#247).
 *
 * The home strip that found this now scrolls (`marquee`, #275); its first six
 * marks stand in for the institutional rows, which still spread.
 */
export const SpreadRowStillWrapsAt1024: Story = {
  parameters: {
    viewport: { options: { desktop1024: { name: 'Desktop 1024', styles: { width: '1024px', height: '800px' } } } },
  },
  globals: { viewport: { value: 'desktop1024' } },
  args: {
    title: 'Venues running on the stack',
    titleHidden: true,
    spread: true,
    items: HOME_VENUES.slice(0, 6),
    locale: 'en',
  },
  play: async () => {
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth)
  },
}

const marqueeArgs = {
  title: 'Venues running on the stack',
  titleHidden: true,
  marquee: true,
  items: HOME_VENUES,
  locale: 'en' as const,
}

/** The home venue strip: a slow, continuous loop (#275). */
export const Marquee: Story = { args: marqueeArgs }

/**
 * The marks exist twice so the loop has no seam — and a screen reader must
 * meet each venue once, and a keyboard must never land in the copy.
 *
 * `getAllByRole` is the query that proves the first: it honours `aria-hidden`,
 * where a DOM query finds both copies.
 */
export const MarqueeDuplicatesAreHiddenFromAssistiveTech: Story = {
  args: marqueeArgs,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const lists = canvasElement.querySelectorAll('ul')

    // Twice in the DOM, which is what makes the loop seamless...
    await expect(lists).toHaveLength(2)
    await expect(canvasElement.querySelectorAll('li')).toHaveLength(HOME_VENUES.length * 2)

    // ...once in the accessibility tree, which is what matters.
    await expect(canvas.getAllByRole('list')).toHaveLength(1)
    const announced = canvas.getAllByRole('listitem').map((item) => item.textContent)
    await expect(announced).toEqual(HOME_VENUES.map((venue) => venue.name))

    // The copy is hidden AND inert: out of the tree and out of the tab order.
    const copy = lists[1]
    await expect(copy).toHaveAttribute('aria-hidden', 'true')
    await expect(copy).toHaveAttribute('inert')
    await expect(lists[0]).not.toHaveAttribute('aria-hidden')
  },
}

/**
 * The seam is invisible only if the animation's `-50%` is exactly one copy.
 *
 * That holds when the two copies are the same width and the track is as wide
 * as both — which needs the track sized to its content. A track as wide as the
 * column would move by half the column and jump at every restart.
 */
export const MarqueeLoopsByExactlyOneCopy: Story = {
  args: marqueeArgs,
  play: async ({ canvasElement }) => {
    const track = canvasElement.querySelector('[data-testid="logo-marquee-track"]') as HTMLElement
    const [first, copy] = [...track.querySelectorAll(':scope > ul')] as HTMLElement[]

    const column = track.parentElement as HTMLElement

    // Retried: on a cold runner the stylesheet can land after the first paint,
    // and an unstyled track measures as wide as its column.
    await waitFor(() => {
      expect(getComputedStyle(track).animationName).toBe('marquee')
      expect(copy.offsetWidth).toBe(first.offsetWidth)
      expect(track.scrollWidth).toBe(first.offsetWidth * 2)
      // Wider than its column, or the second copy would trail a gap behind it.
      expect(first.offsetWidth).toBeGreaterThan(column.clientWidth)
    })
  },
}

/** Every `@media (prefers-reduced-motion: reduce)` rule that applies to `el`. */
function reducedMotionRules(el: Element): CSSStyleDeclaration[] {
  const found: CSSStyleDeclaration[] = []
  for (const sheet of [...document.styleSheets]) {
    let rules: CSSRuleList
    try {
      rules = sheet.cssRules
    } catch {
      continue // cross-origin sheet; not ours
    }
    for (const rule of [...rules]) {
      if (!(rule instanceof CSSMediaRule) || !rule.conditionText.includes('prefers-reduced-motion: reduce')) continue
      for (const inner of [...rule.cssRules]) {
        if (inner instanceof CSSStyleRule && el.matches(inner.selectorText)) found.push(inner.style)
      }
    }
  }
  return found
}

/**
 * Reduced motion stops the loop and shows the row still, every mark reachable.
 *
 * Asserted against the stylesheet rather than class names: the rule has to
 * exist under the reduced-motion query and match the element, which a typo in
 * an arbitrary-value class would quietly fail to do.
 */
export const MarqueeStopsWhenReducedMotionIsPreferred: Story = {
  args: marqueeArgs,
  play: async ({ canvasElement }) => {
    const track = canvasElement.querySelector('[data-testid="logo-marquee-track"]') as HTMLElement
    const [first, copy] = [...track.querySelectorAll(':scope > ul')] as HTMLElement[]

    await waitFor(() => {
      // The animation is switched off on the element that runs it...
      expect(reducedMotionRules(track).some((style) => style.animationName === 'none')).toBe(true)
      // ...the copy goes, so nothing is shown twice...
      expect(reducedMotionRules(copy).some((style) => style.display === 'none')).toBe(true)
      // ...and the real list wraps, so every mark is on screen without moving.
      expect(reducedMotionRules(first).some((style) => style.flexWrap === 'wrap')).toBe(true)
    })
  },
}

/**
 * A keyboard can stop the loop: the strip is a named tab stop, and focusing it
 * pauses the animation.
 *
 * The marks themselves are not focusable, so a `focus-within` pause with no
 * tab stop of its own could never fire. Tested by focusing the strip and
 * reading the computed play state, not by looking for the class.
 */
export const MarqueePausesOnKeyboardFocus: Story = {
  args: marqueeArgs,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const strip = canvas.getByRole('group', { name: marqueeArgs.title })
    const track = canvasElement.querySelector('[data-testid="logo-marquee-track"]') as HTMLElement

    await expect(strip).toHaveAttribute('tabindex', '0')
    await waitFor(() => expect(getComputedStyle(track).animationPlayState).toBe('running'))

    strip.focus()
    await waitFor(() => expect(getComputedStyle(track).animationPlayState).toBe('paused'))

    strip.blur()
    await waitFor(() => expect(getComputedStyle(track).animationPlayState).toBe('running'))

    // The pointer gets the same through `:hover` on the same group, which a
    // synthetic event cannot trigger — so that half is checked by class.
    await expect(track).toHaveClass('group-hover/marquee:[animation-play-state:paused]')
  },
}
