import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { OrbsLogo } from '@/components/icons'
import { FooterLink2 } from '@/components/ui/footer-link'
import { Prose } from '@/components/marketing/prose'
import { FOOTER_COLUMNS, FOOTER_EMAIL, FOOTER_POLICY_LINKS, FOOTER_SOCIALS } from '@/content/shared/footer'
import { localeHref } from '@/i18n/availability'
import { localePath, type Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'
import { FooterNavColumn } from './footer-nav'
import { FooterSocials } from './footer-socials'

/**
 * The site footer, ported from the legacy `partials/footer/`.
 *
 * Two of the legacy sections are deliberately not here:
 *
 *  - **Subscribe.** A popup form posting to a mailing-list backend, which is #35
 *    (Resend route handlers, Phase 4). Porting the markup without the handler
 *    would ship a form that silently does nothing.
 *  - **Latest tweets.** An embedded Twitter widget — a third-party script in the
 *    chrome of all 456 prerendered pages. That is #33 (interactive widgets),
 *    where its cost can be weighed on its own.
 *
 * The legacy "Latest Blog Posts" block is absent too. Unlike the other two it
 * has no ticket, because it is not a port: it needs a Contentful fetch, and
 * putting one in a component that renders on every page is a decision about the
 * whole site's data flow rather than about the footer. Left for a follow-up.
 *
 * Every `t()` call in the footer tree happens here. The children take resolved
 * strings, which is what keeps them synchronous and gives them stories — the
 * repo's only test surface.
 *
 * The locale is a prop for the same reason as in `Header`: with no `[locale]`
 * segment and no middleware, next-intl's hooks cannot resolve it from the
 * request and quietly return English.
 */
export async function Footer({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'footer' })

  const socialLabels = Object.fromEntries(FOOTER_SOCIALS.map((social) => [social.key, t(`socials.${social.key}`)]))

  return (
    <footer className="mt-20 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-5 py-12">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,20rem)_1fr]">
          <section>
            <Link
              href={localePath(locale, '/')}
              aria-label={t('homeLink')}
              // Same per-string rule as the header logo: `homeLink` is the
              // English "Orbs home" in Japanese but "Orbs 홈" in Korean, so only
              // one of them needs marking. Without it the Japanese document's
              // `lang` applies Japanese pronunciation to an English name.
              lang={textLang(t('homeLink'), locale)}
              className="inline-flex"
            >
              {/*
                Hidden for the same reason as in the header: the lockup's own
                wordmark would be a second piece of content inside a link that
                is already labelled.
              */}
              <OrbsLogo className="text-xl" aria-hidden />
            </Link>

            {/*
              `Prose` renders paragraphs and bold, not links. The legacy blurb
              links dLIMIT, dTWAP and Liquidity Hub inline; all three sit in the
              Powered by Orbs column a few inches away, so the catalog copy drops
              the inline markup rather than teaching the renderer link syntax for
              a duplicate of an adjacent link.
            */}
            <Prose text={t('blurb')} className="mt-6 text-detail" />

            <a
              href={`mailto:${FOOTER_EMAIL}`}
              className="mt-6 inline-flex text-detail font-medium text-fg-muted transition-colors hover:text-link"
            >
              {FOOTER_EMAIL}
            </a>
          </section>

          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
            {FOOTER_COLUMNS.map((column) => (
              <FooterNavColumn
                key={column.key}
                id={`footer-${column.key}`}
                title={t(`columns.${column.key}`)}
                items={column.links.map((spec) => ({ spec, label: t(`links.${spec.key}`) }))}
                locale={locale}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto flex flex-col-reverse items-center gap-6 px-5 py-6 sm:flex-row sm:justify-between">
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {FOOTER_POLICY_LINKS.map((spec) => ({ spec, label: t(`links.${spec.key}`) }))
              // Same empty-label rule as the nav columns: the legacy Japanese
              // footer carries Terms of Use and Privacy Policy but no
              // accessibility declaration.
              .filter(({ label }) => label.trim() !== '')
              .map(({ spec, label }) => (
                <li key={spec.key}>
                  <FooterLink2 asChild lang={textLang(label, locale)}>
                    <Link href={localeHref(spec.href, locale)}>{label}</Link>
                  </FooterLink2>
                </li>
              ))}
          </ul>

          <FooterSocials labels={socialLabels} />
        </div>
      </div>
    </footer>
  )
}
