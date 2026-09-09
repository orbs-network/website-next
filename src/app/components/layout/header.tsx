import { Button } from '@/components/ui/button'
import { OrbsLogo } from '@/components/icons'
import { localePath, type Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'
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

  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-5">
        <div className="flex items-center justify-between h-16">
          <Link
            href={localePath(locale, '/')}
            aria-label={t('homeLink')}
            // Decided from the string, not the locale: `homeLink` is "Orbs home"
            // in Japanese but "Orbs 홈" in Korean, so only one of them needs it.
            lang={textLang(t('homeLink'), locale)}
            className="text-xl font-bold text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            {/*
              The lockup contains the word "Orbs", which inside a link that
              already carries an `aria-label` would be a second piece of content
              in one link — so it is hidden and the link keeps one accessible
              name. Sized by font size: the lockup scales its mark from `em`.
            */}
            <OrbsLogo className="text-xl" aria-hidden />
          </Link>

          <NavMenu locale={locale} />

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <LanguageSelector />
            <Button size="sm" lang={textLang(t('getInTouch'), locale)}>
              {t('getInTouch')}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
