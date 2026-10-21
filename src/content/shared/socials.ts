import type { Locale } from '@/i18n/locales'

/** Korean community destinations; other locales retain their existing links. */
export const KOREAN_SOCIAL_LINKS = {
  x: 'https://x.com/orbs_korea',
  telegram: 'https://t.me/orbskrannouncement',
  youtube: 'https://bit.ly/3hFQfnC',
} as const

export function socialHrefForLocale(platform: string, fallback: string, locale: Locale): string {
  if (locale !== 'ko') return fallback
  return KOREAN_SOCIAL_LINKS[platform as keyof typeof KOREAN_SOCIAL_LINKS] ?? fallback
}
