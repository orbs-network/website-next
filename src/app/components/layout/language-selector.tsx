'use client'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { localeHref, shouldShowSelector } from '@/i18n/availability'
import { LOCALE_LABELS, LOCALES, splitLocale } from '@/i18n/locales'
import { ChevronDownIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

/**
 * Switches locale by navigating, not by setting state.
 *
 * The previous version tracked the choice in `useState`, so picking a language
 * changed the label and nothing else. Locale is a property of the URL here, so
 * the only way to change it is to go to a different one.
 *
 * These are plain `<a>` elements rather than `next/link`. Each locale has its
 * own root layout (see root-shell.tsx), and Next cannot client-side navigate
 * between root layouts — swapping `<html lang>` needs a full document load.
 * `next/link` would prefetch a transition it then has to abandon.
 */
export function LanguageSelector() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const t = useTranslations('languageSelector')

  const { locale: currentLocale, pathname: localeFreePath } = splitLocale(pathname)

  // English-only pages get no selector — see availability.ts for which and why.
  if (!shouldShowSelector(localeFreePath)) {
    return null
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs text-fg transition-colors hover:text-accent-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {LOCALE_LABELS[currentLocale]}
          <ChevronDownIcon
            className="transition-transform duration-200 size-5"
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
          <span className="sr-only">{t('label')}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LOCALES.map((locale) => (
          <DropdownMenuItem key={locale} asChild className="text-xs">
            <a href={localeHref(localeFreePath, locale)} hrefLang={locale} lang={locale}>
              {LOCALE_LABELS[locale]}
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
