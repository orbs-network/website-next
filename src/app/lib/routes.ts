/**
 * Single source of truth for content URL shapes.
 *
 * Blog posts currently live at the root (`/<slug>`), matching the legacy
 * Cuttlebelle site. Moving them under `/blog/<slug>` is tracked in #16 — when
 * that lands, change `postPath` here and the revalidation webhook, preview
 * handler, sitemap and RSS feed all follow.
 */
export function postPath(slug: string): string {
  return `/${slug}`
}

export const BLOG_INDEX_PATH = '/blog'
export const HOME_PATH = '/'
