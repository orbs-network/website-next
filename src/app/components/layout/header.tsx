import { Button } from '@/components/ui/button'
import { OrbsLogo } from '@/components/icons'
import { LOCALE_CHROME_LANG, LOCALE_HTML_LANG, localePath, type Locale } from '@/i18n/locales'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { ThemeToggle } from '../theme/theme-toggle'
import { LanguageSelector } from './language-selector'
import { NavMenu } from './navigation/nav-menu'

/**
 * The locale arrives as a prop rather than from a next-intl hook.
 *
 * `useLocale()` and `useTranslations()` resolve against `getRequestConfig`, and
 * with no `[locale]` segment and no middleware there is nothing there to resolve
 * against — every request looks like the default locale, so the header rendered
 * English on `/jp/` and `/ko/` and pointed the logo at the English home page.
 *
 * `getTranslations({locale})` takes the locale explicitly, and the root layout
 * knows it statically from its own position in the route tree. Passing it down
 * keeps that fact where it is actually known instead of inferring it from the
 * request, which would also force these pages out of static prerendering.
 */
export async function Header({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'header' })

  // On /jp/ the chrome catalog is English (see LOCALE_CHROME_LANG), so the nav
  // and the CTA are English text inside a `lang="ja"` document. Marking them
  // stops a screen reader applying Japanese pronunciation to English words.
  // `undefined` when the chrome matches the document, so no redundant attribute.
  const chromeLang = LOCALE_CHROME_LANG[locale]
  const fallbackLang = chromeLang === locale ? undefined : LOCALE_HTML_LANG[chromeLang]

  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-5">
        <div className="flex items-center justify-between h-16">
          <Link
            href={localePath(locale, '/')}
            aria-label={t('homeLink')}
            // `homeLink` comes from the same catalog as the nav and CTA, so it
            // is English on /jp/ too and needs the same annotation.
            lang={fallbackLang}
            className="text-xl font-bold text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <OrbsLogo />
          </Link>

          <div lang={fallbackLang}>
            <NavMenu locale={locale} />
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {/* The selector's own label IS translated in every locale, so it
                stays outside the fallback wrapper. */}
            <LanguageSelector />
            <Button size="sm" lang={fallbackLang}>
              {t('getInTouch')}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
