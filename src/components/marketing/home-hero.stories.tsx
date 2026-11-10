import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import en from '@/i18n/messages/en.json'
import ko from '@/i18n/messages/ko.json'
import { HOME_STATS } from '@/content/pages/home'
import { SDK_DOCS_URL } from '@/content/shared/sdk'
import { Button } from '@/components/ui/button'
import { HomeHero } from './home-hero'

const meta = {
  title: 'Marketing/Home Hero',
  component: HomeHero,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof HomeHero>
export default meta
type Story = StoryObj<typeof meta>

function args(locale: 'en' | 'ko') {
  const messages = { en, ko }[locale].pages.home
  return {
    headline: messages.hero.headline,
    intro: messages.hero.intro,
    locale,
    stats: HOME_STATS.map((id) => ({ id, ...messages.stats[id] })),
    children: (
      <>
        <Button asChild variant="solid">
          <a href={locale === 'ko' ? '/ko/contact/' : '/contact/'}>{messages.hero.cta}</a>
        </Button>
        <Button asChild variant="overlay">
          <a href={SDK_DOCS_URL}>{messages.sdk}</a>
        </Button>
      </>
    ),
  }
}

export const English: Story = {
  args: args('en'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const heading = canvas.getByRole('heading', { level: 1 })
    const hero = heading.closest('section')!
    const stats = hero.querySelector('dl')!
    await expect(hero.querySelectorAll('dd')).toHaveLength(5)
    await expect(canvas.getByText('1.1B')).toBeVisible()
    // Reserve the real header's 100px within a 900px desktop first fold.
    if (window.innerWidth >= 1024) {
      await expect(parseFloat(getComputedStyle(heading).fontSize)).toBeGreaterThanOrEqual(56)
      await expect(getComputedStyle(heading).whiteSpace).toBe('normal')
      await expect(stats.getBoundingClientRect().bottom - hero.getBoundingClientRect().top).toBeLessThanOrEqual(800)
      // Keeping the figures in view alone is insufficient: the following
      // section must also stay below the fold, including on tall displays.
      await expect(hero.getBoundingClientRect().height + 100).toBeGreaterThanOrEqual(window.innerHeight)
    }
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth + 1)
  },
}

export const Korean: Story = {
  args: args('ko'),
  play: async ({ canvasElement }) => {
    const heading = within(canvasElement).getByRole('heading', { level: 1 })
    await expect(getComputedStyle(heading).whiteSpace).toBe('normal')
    await expect(heading.querySelector('br')).toBeNull()
  },
}
