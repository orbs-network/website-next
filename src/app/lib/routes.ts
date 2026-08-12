/**
 * Single source of truth for content URL shapes.
 *
 * Blog posts live at the root (`/<slug>/`), matching the legacy Cuttlebelle
 * site — `prebuild.sh` there flattens `content/blog/*` up to `content/` before
 * the build, so posts are not served under `/blog/`.
 *
 * **Every path here ends with a trailing slash**, because `trailingSlash: true`
 * is set in next.config.mjs to match production. That is not cosmetic:
 * `revalidatePath()` keys off the exact runtime pathname, so a slashless path
 * here silently invalidates nothing and leaves stale HTML live until the 1h
 * fallback. Same for canonical URLs, which would otherwise point at a URL that
 * 308s.
 */
export function postPath(slug: string): string {
  return `/${slug}/`
}

export const BLOG_INDEX_PATH = '/blog/'
export const HOME_PATH = '/'

/**
 * Page 1 lives at `/blog/` rather than `/blog/page/1/`, so there is exactly one
 * URL for it. Emitting both would split ranking signals between duplicates.
 */
export function blogPagePath(pageNumber: number): string {
  return pageNumber <= 1 ? BLOG_INDEX_PATH : `${BLOG_INDEX_PATH}page/${pageNumber}/`
}

/**
 * The route pattern, not a concrete URL. Passed to `revalidatePath(path, 'page')`
 * to invalidate every generated page of the archive at once.
 *
 * Publishing a post shifts every later post down, so a single publish changes
 * all N archive pages — not just the first. Targeting them individually would
 * mean fetching the page count on every webhook.
 */
export const BLOG_PAGE_ROUTE = '/blog/page/[n]'
