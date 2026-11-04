import type { Metadata } from 'next'
import type { Locale } from '@/i18n/locales'
import heroImages from '@/content/social-images.json'
import { siteUrl } from './site'

export type SocialImage = { url: string; width?: number; height?: number; alt?: string }

/** The existing branded Orbs cover, also used by blog cards without artwork. */
export const DEFAULT_SOCIAL_IMAGE: SocialImage = {
  url: '/blog/placeholder.png',
  width: 1541,
  height: 869,
  alt: 'Orbs — Bringing CeFi-level execution to DeFi',
}

const OG_LOCALES: Record<Locale, string> = { en: 'en_US', ja: 'ja_JP', ko: 'ko_KR' }
const heroes: Record<string, { source: string; locales?: readonly string[] }> = heroImages

export function marketingSocialImage(path: string, locale: Locale): SocialImage | undefined {
  const hero = heroes[path]
  if (!hero || (hero.locales && !hero.locales.includes(locale))) return undefined
  return { url: `/social${path}.png`, width: 1200, height: 630 }
}

type SocialMetadataInput = {
  title: string
  description: string
  /** Canonical page URL/path; omitted for a layout or 404 rather than claiming the home URL. */
  path?: string
  locale?: Locale
  image?: SocialImage | null
  article?: { publishedTime?: string; modifiedTime?: string; authors?: string[] }
}

/** Complete objects per page: Next replaces nested OG/Twitter metadata rather than merging it. */
export function socialMetadata({
  title,
  description,
  path,
  locale = 'en',
  image,
  article,
}: SocialMetadataInput): Pick<Metadata, 'openGraph' | 'twitter'> {
  const artwork = image ?? DEFAULT_SOCIAL_IMAGE
  const url = new URL(artwork.url, siteUrl).href
  const shareTitle = title === 'Orbs' ? title : `${title} | Orbs`
  const common = {
    title: shareTitle,
    description,
    siteName: 'Orbs',
    locale: OG_LOCALES[locale],
    ...(path ? { url: new URL(path, siteUrl).href } : {}),
    images: [{ ...artwork, url, alt: artwork.alt ?? title }],
  }

  return {
    openGraph: article ? { ...common, type: 'article', ...article } : { ...common, type: 'website' },
    twitter: {
      card: 'summary_large_image',
      site: '@orbs_network',
      title: shareTitle,
      description,
      images: [{ url, alt: artwork.alt ?? title }],
    },
  }
}

/** Enrich a page without changing its existing title, canonical/hreflang, or robots rules. */
export function withSocialMetadata<T extends Metadata & { title: string; description: string }>(
  metadata: T,
  options: Omit<SocialMetadataInput, 'title' | 'description' | 'path'> = {}
): T & Pick<Metadata, 'openGraph' | 'twitter'> {
  const canonical = metadata.alternates?.canonical
  const path = typeof canonical === 'string' ? canonical : canonical instanceof URL ? canonical.href : undefined
  return {
    ...metadata,
    ...socialMetadata({ title: metadata.title, description: metadata.description, path, ...options }),
  }
}
