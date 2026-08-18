import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { findMarketingPage } from '@/app/marketing/registry'
import { localeAlternates, localesFor, placeholderRobots } from '@/i18n/availability'
import { MARKETING_PAGE_PATHS } from '@/content/pages'

const LOCALE = 'ja' as const

/**
 * Japanese marketing pages, plus the 404 for everything else under this locale.
 *
 * One route resolves every Japanese page through the shared registry, so adding a
 * translation is catalog entries and one `AVAILABILITY` line — no file here
 * changes. See `src/app/marketing/registry.ts` for why this is not a file per
 * page.
 *
 * It doubles as the locale's 404 boundary. Without it an unmatched URL under
 * `/jp/` matches no route at all, and with three root layouts there is
 * no shared ancestor for Next to render a global `not-found` into — so it falls
 * through to a bare error shell with no header or styling.
 *
 * Static and dynamic routes both take precedence over a catch-all, so this can
 * never shadow a real route.
 */
export function generateStaticParams() {
  return MARKETING_PAGE_PATHS.filter((path) => localesFor(path).includes(LOCALE)).map((path) => ({
    rest: path.split('/').filter(Boolean),
  }))
}

function pathFor(rest: string[] | undefined): string {
  return `/${(rest ?? []).join('/')}`
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ rest?: string[] }>
}): Promise<Metadata> {
  const path = pathFor((await params).rest)

  if (!findMarketingPage(path)) {
    return {}
  }

  return {
    alternates: localeAlternates(path, LOCALE),
    robots: placeholderRobots(path, LOCALE),
  }
}

export default async function LocaleMarketingPage({ params }: { params: Promise<{ rest?: string[] }> }) {
  const path = pathFor((await params).rest)
  const render = findMarketingPage(path)

  if (!render) {
    notFound()
  }

  return render(LOCALE)
}
