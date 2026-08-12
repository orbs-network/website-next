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

/**
 * Page 1 lives at `/blog` rather than `/blog/page/1`, so there is exactly one
 * URL for it. Emitting both would split ranking signals between duplicates.
 */
export function blogPagePath(pageNumber: number): string {
  return pageNumber <= 1 ? BLOG_INDEX_PATH : `${BLOG_INDEX_PATH}/page/${pageNumber}`
}
