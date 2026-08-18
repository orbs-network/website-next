import type { Locale } from '@/i18n/locales'
import { MARKETING_PAGE_PATHS, type MarketingPagePath } from '@/content/pages'
import { DtwapPage } from './dtwap'

/**
 * Renders a page for a locale.
 *
 * A render function rather than a component reference. Storing components and
 * instantiating the looked-up value as JSX trips `react-hooks/static-components`
 * — the compiler cannot distinguish a registry lookup from a component defined
 * inline during render, and it is right to be suspicious of the latter. Holding
 * the JSX here keeps every component statically referenced at module scope.
 */
type MarketingPageRenderer = (locale: Locale) => React.ReactNode

/**
 * Which page renders at each marketing path.
 *
 * The Japanese and Korean routes resolve through this rather than each having a
 * file per page. At parity that is 44 locale variants; as thin route files they
 * would be 44 near-identical modules that must each be remembered when a page
 * changes. Here, adding a translation is catalog entries plus one
 * `AVAILABILITY` line, and nothing under `src/app` changes at all.
 *
 * English keeps conventional per-page routes at the root (`app/(en)/dtwap`),
 * because English is the canonical structure and benefits from colocated
 * metadata and an app tree that shows what exists.
 *
 * Typed as `Record<MarketingPagePath, ...>` so the build fails if a path is
 * added to `MARKETING_PAGE_PATHS` without a renderer, or vice versa — the
 * reserved-slug guard reads that list, and the two disagreeing would mean a
 * route that exists but is not reserved.
 */
const MARKETING_PAGES: Record<MarketingPagePath, MarketingPageRenderer> = {
  '/dtwap': (locale) => <DtwapPage locale={locale} />,
}

/**
 * Resolve a locale-independent path to its renderer, or `undefined`.
 *
 * Accepts the path with or without a trailing slash: it is rebuilt from a
 * catch-all's segments, which never carry one, while `AVAILABILITY` keys and
 * `MARKETING_PAGE_PATHS` are written without one.
 */
export function findMarketingPage(pathname: string): MarketingPageRenderer | undefined {
  const normalized = pathname !== '/' && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname

  return MARKETING_PAGES[normalized as MarketingPagePath]
}

export { MARKETING_PAGE_PATHS }
