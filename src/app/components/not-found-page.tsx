import { Button } from '@/components/ui/button'
import { localePath, type Locale } from '@/i18n/locales'
import Link from 'next/link'
import { H1 } from './typography'

/**
 * Shared 404 body.
 *
 * Each locale route group needs its own `not-found.tsx`, because a `not-found`
 * boundary only covers its own segment tree. Without one inside `(jp)`/`(ko)`,
 * an unmatched URL under `/jp/` fell through to Next's bare error shell — a
 * 7 KB page with no header, no nav and no styling — while `/nope/` and
 * `/blog/page/999/` rendered a proper 404 inside the site chrome.
 *
 * That regression came from removing the single `app/layout.tsx`: it used to
 * wrap the default not-found, and with three root layouts there is no longer a
 * shared ancestor to inherit from.
 *
 * The copy is English and marked as such, matching every other untranslated
 * string here — translating it would mean inventing Korean and Japanese the
 * legacy site never had.
 */
export function NotFoundPage({ locale }: { locale: Locale }) {
  return (
    <div className="container mx-auto px-5 py-24 text-center" lang="en">
      <H1 className="mb-4">Page not found</H1>
      <p className="mb-8 text-gray-600 dark:text-gray-400">
        That page doesn&apos;t exist, or it may have moved.
      </p>

      <Button asChild size="lg">
        <Link href={localePath(locale, '/')}>Go to the home page</Link>
      </Button>
    </div>
  )
}
