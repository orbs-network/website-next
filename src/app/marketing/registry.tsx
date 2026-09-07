import { localesFor } from '@/i18n/availability'
import type { Locale } from '@/i18n/locales'
import { MARKETING_PAGE_PATHS, type MarketingPagePath } from '@/content/pages'
import { DlimitPage } from './dlimit'
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

export type MarketingPageEntry = {
  render: MarketingPageRenderer
  /**
   * Catalog namespace holding this page's copy, including its `meta.title` and
   * `meta.description`.
   *
   * Metadata lives in the catalog rather than on the route so that all three
   * locales get it from one place. When it was hardcoded on the English route,
   * `/jp/dtwap/` and `/ko/dtwap/` inherited the root layout's generic `Orbs`
   * title and "Bringing CeFi execution to DeFi" description — wrong on any
   * indexable translated page, and invisible unless you read the built HTML.
   */
  namespace: string
}

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
const MARKETING_PAGES: Record<MarketingPagePath, MarketingPageEntry> = {
  '/dtwap': { render: (locale) => <DtwapPage locale={locale} />, namespace: 'pages.dtwap' },
  '/dlimit': { render: (locale) => <DlimitPage locale={locale} />, namespace: 'pages.dlimit' },
}

/**
 * Resolve a locale-independent path to its registry entry, or `undefined`.
 *
 * Accepts the path with or without a trailing slash: it is rebuilt from a
 * catch-all's segments, which never carry one, while `AVAILABILITY` keys and
 * `MARKETING_PAGE_PATHS` are written without one.
 */
export function findMarketingPage(pathname: string): MarketingPageEntry | undefined {
  const normalized = pathname !== '/' && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname

  return MARKETING_PAGES[normalized as MarketingPagePath]
}

/**
 * The same lookup, but only if the page exists in this locale.
 *
 * `generateStaticParams` already omits locales a page is not available in, but
 * that only decides what gets prerendered — `dynamicParams` defaults to true,
 * so a direct request to `/jp/<english-only-page>/` still reaches the route. A
 * bare registry lookup succeeds there and renders the English page inside a
 * `lang="ja"` document, indexable, with no locale fallback: precisely what the
 * availability map exists to prevent.
 *
 * It does not bite today, because `/dtwap` is available in all three locales.
 * It bites the first time a page is English-only — which is the documented
 * default for any path with no `AVAILABILITY` entry, so it would arrive
 * silently.
 *
 * Both the renderer and `marketingMetadata` go through this, so a page cannot
 * 404 while still emitting metadata, or vice versa.
 */
export function findLocaleMarketingPage(pathname: string, locale: Locale): MarketingPageEntry | undefined {
  const entry = findMarketingPage(pathname)

  if (!entry || !localesFor(pathname).includes(locale)) {
    return undefined
  }

  return entry
}

export { MARKETING_PAGE_PATHS }
