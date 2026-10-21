import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { FooterSocials } from '@/app/components/layout/footer/footer-socials'
import { ClosingSocialButtons } from '@/components/marketing/closing-cta'
import { CONTACT_CHANNELS, contactChannelsForLocale } from '@/content/pages/contact'
import { FOOTER_SOCIALS } from './footer'
import { KOREAN_SOCIAL_LINKS } from './socials'

const labels = Object.fromEntries(FOOTER_SOCIALS.map((social) => [social.key, social.key]))

describe('Korean edition community destinations', () => {
  it('overrides only three footer destinations and preserves new-tab behavior', () => {
    const html = renderToStaticMarkup(createElement(FooterSocials, { labels, locale: 'ko' }))
    for (const href of Object.values(KOREAN_SOCIAL_LINKS)) expect(html).toContain(`href="${href}"`)
    for (const social of FOOTER_SOCIALS.filter(({ key }) => ['github', 'discord', 'snapshot'].includes(key))) {
      expect(html).toContain(`href="${social.href}"`)
    }
    expect(html.match(/target="_blank"/g)).toHaveLength(6)
    const original = renderToStaticMarkup(createElement(FooterSocials, { labels }))
    for (const locale of ['en', 'ja'] as const) {
      expect(renderToStaticMarkup(createElement(FooterSocials, { labels, locale }))).toBe(original)
    }
  })

  it('updates the shared closing CTAs without changing English and Japanese links', () => {
    const props = {
      follow: 'Follow',
      community: 'Join',
      x: 'https://twitter.com/orbs_network',
      telegram: 'https://t.me/OrbsNetwork',
    }
    const korean = renderToStaticMarkup(createElement(ClosingSocialButtons, { ...props, locale: 'ko' }))
    expect(korean).toContain(`href="${KOREAN_SOCIAL_LINKS.x}"`)
    expect(korean).toContain(`href="${KOREAN_SOCIAL_LINKS.telegram}"`)
    for (const locale of ['en', 'ja'] as const) {
      const html = renderToStaticMarkup(createElement(ClosingSocialButtons, { ...props, locale }))
      expect(html).toContain(`href="${props.x}"`)
      expect(html).toContain(`href="${props.telegram}"`)
    }
  })

  it('updates only Korean-audience contact rows on the Korean page', () => {
    expect(contactChannelsForLocale('en')).toBe(CONTACT_CHANNELS)
    expect(contactChannelsForLocale('ja')).toBe(CONTACT_CHANNELS)
    for (const group of contactChannelsForLocale('ko')) {
      const original = CONTACT_CHANNELS.find(({ key }) => key === group.key)!
      expect(group.links.filter(({ language }) => language !== 'ko')).toEqual(
        original.links.filter(({ language }) => language !== 'ko')
      )
      const korean = group.links.find(({ language }) => language === 'ko')
      const key = group.key === 'community' ? 'telegram' : group.key
      if (key in KOREAN_SOCIAL_LINKS)
        expect(korean?.url).toBe(KOREAN_SOCIAL_LINKS[key as keyof typeof KOREAN_SOCIAL_LINKS])
    }
  })
})
