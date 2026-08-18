import { Button } from '@/components/ui/button'
import { OrbsLogo } from '@/components/icons'
import { localePath, type Locale } from '@/i18n/locales'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { ThemeToggle } from '../theme/theme-toggle'
import { LanguageSelector } from './language-selector'
import { NavMenu } from './navigation/nav-menu'

export function Header() {
  const t = useTranslations('header')
  // From the provider the root layout established, so the logo returns you to
  // the home page of the site you are reading rather than the English one.
  const locale = useLocale() as Locale

  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-5">
        <div className="flex items-center justify-between h-16">
          <Link
            href={localePath(locale, '/')}
            aria-label={t('homeLink')}
            className="text-xl font-bold text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <OrbsLogo />
          </Link>

          <NavMenu />

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <LanguageSelector />
            <Button size="sm">{t('getInTouch')}</Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
