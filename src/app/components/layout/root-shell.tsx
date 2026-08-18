import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import '../../globals.css'
import { getMessages } from 'next-intl/server'
import { ThemeProvider } from 'next-themes'
import { LOCALE_HTML_LANG, type Locale } from '@/i18n/locales'
import { Header } from './header'

const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '500', '600', '700', '900'] })

/**
 * Shared by the three root layouts so they cannot drift.
 *
 * Deliberately carries no `alternates`. Metadata is inherited by descendants, so
 * a canonical or hreflang set here would be wrong for every page that did not
 * override it — the blog archive would claim the home page's canonical. Pages
 * that have locale variants declare their own alternates.
 */
export const ROOT_METADATA: Metadata = {
  title: {
    default: 'Orbs',
    template: '%s | Orbs',
  },
  description: 'Bringing CeFi execution to DeFi.',
}

/**
 * The `<html>`/`<body>` shell, shared by all three root layouts.
 *
 * There are three root layouts — one per locale route group — rather than a
 * single `app/layout.tsx`, because `<html lang>` can only be set by a root
 * layout and it has to differ per locale. A single root layout would have to
 * hardcode `lang="en"`, mislabelling every Japanese and Korean page: screen
 * readers would use English pronunciation rules on Korean text, and `lang` is a
 * signal search engines read.
 *
 * The cost is that moving between locales is a full document load rather than a
 * client-side transition. That is the documented behaviour of multiple root
 * layouts, and it is the right trade here — switching language is a deliberate,
 * rare action, and a reload is what the legacy site did anyway.
 */
export async function RootShell({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  // Explicit locale: with no `[locale]` segment and no middleware, next-intl
  // cannot infer it. See src/i18n/request.ts.
  const messages = await getMessages({ locale })

  return (
    <html lang={LOCALE_HTML_LANG[locale]} suppressHydrationWarning>
      <body className={montserrat.className}>
        {/*
          Only the namespaces client components actually read are handed to the
          provider. Whatever goes in here is serialized into the RSC payload of
          every page, so passing the whole catalog would put all of it inline in
          all 456 prerendered post pages — for a language selector most of them
          do not even render. The header and nav are server components and read
          their messages server-side, so they need nothing here.

          When Phase 3 adds page copy to the catalogs this matters a lot more:
          those namespaces must stay out of this object unless a client
          component needs them.
        */}
        <NextIntlClientProvider locale={locale} messages={{ languageSelector: messages.languageSelector }}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <Header locale={locale} />
            <main>{children}</main>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
