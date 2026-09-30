import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { OrbsLogo } from '@/components/icons'
import { FooterLink2 } from '@/components/ui/footer-link'
import { FOOTER_COLUMNS, FOOTER_POLICY_LINKS, FOOTER_SOCIALS, FOOTER_STATUS_URL } from '@/content/shared/footer'
import { NetworkStatusIndicator } from './network-status'
import { localeHref } from '@/i18n/availability'
import { localePath, type Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'
import { FooterNavColumn } from './footer-nav'
import { FooterSocials } from './footer-socials'

/**
 * The site footer, from the 3.4 `Footer` component in Figma.
 *
 * Laid out as the design draws it: the logo and blurb across the top, then a
 * band between two rules, split by a vertical one. Left of it, four sitemap
 * columns over the bottom bar; right of it, Company over the social row. That
 * band is a two-by-two grid rather than two flex columns so the bottom bar and
 * the socials share a row and stay level whatever either column's height.
 *
 * The DOM order is the reading order on every width — four columns, Company,
 * the bottom bar, socials — so below `lg` the grid simply stacks.
 *
 * Every `t()` call in the footer tree happens here. The children take resolved
 * strings, which is what keeps them synchronous and gives them stories.
 *
 * The locale is a prop for the same reason as in `Header`: with no `[locale]`
 * segment and no middleware, next-intl's hooks cannot resolve it from the
 * request and quietly return English.
 *
 * Left out, on purpose:
 *  - **Subscribe** and **latest tweets** from the legacy footer — #145 and #33.
 *  - **The contact email.** 3.4 moves it to the mobile menu (`MobileNav`), and
 *    `/contact` is one column away.
 */
export async function Footer({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'footer' })

  const socialLabels = Object.fromEntries(FOOTER_SOCIALS.map((social) => [social.key, t(`socials.${social.key}`)]))
  const columns = FOOTER_COLUMNS.map((column) => (
    <FooterNavColumn
      key={column.key}
      id={`footer-${column.key}`}
      title={t(`columns.${column.key}`)}
      items={column.links.map((spec) => ({ spec, label: t(`links.${spec.key}`) }))}
      locale={locale}
    />
  ))
  const sitemap = columns.slice(0, -1)
  const company = columns.at(-1)
  const blurb = t('blurb')

  return (
    <footer className="mt-20 py-16 lg:py-[5.625rem]">
      <div className="container">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-[5.4375rem]">
          <Link
            href={localePath(locale, '/')}
            aria-label={t('homeLink')}
            // Same per-string rule as the header logo: `homeLink` is the
            // English "Orbs home" in Japanese but "Orbs 홈" in Korean, so only
            // one of them needs marking.
            lang={textLang(t('homeLink'), locale)}
            className="inline-flex shrink-0"
          >
            {/* Hidden: the lockup's wordmark would be a second name inside a link that is already labelled. */}
            <OrbsLogo className="text-[1.875rem]" aria-hidden />
          </Link>

          <p
            lang={textLang(blurb, locale)}
            className="max-w-[41.75rem] text-[0.9375rem] leading-[1.4375rem] tracking-[-0.033em] text-fg lg:p-2.5"
          >
            {blurb}
          </p>
        </div>

        {/*
          The rules are `neutral-500` in both themes, as drawn — not `border`,
          which is a quieter grey in each and loses the band on the light theme.
        */}
        <div className="mt-5 grid border-y border-neutral-500 lg:grid-cols-[minmax(0,1fr)_20.625rem]">
          <div className="grid grid-cols-2 gap-x-[1.125rem] gap-y-10 pt-[3.75rem] md:grid-cols-4 lg:pr-4">
            {sitemap}
          </div>

          <div className="pt-10 lg:border-l lg:border-neutral-500 lg:pl-6 lg:pt-[3.75rem]">{company}</div>

          <ul className="flex flex-wrap items-center gap-x-8 gap-y-2 pb-7 pt-12 lg:row-start-2 lg:pt-[3.625rem]">
            {/*
              The status indicator leads the bar, as 3.4 draws it, and is absent
              when the service cannot be read rather than falling back to a
              green dot. See `network-status.tsx`.

              `empty:hidden` because the indicator renders nothing until a
              reading arrives, and nothing at all if one never does. Without it
              this `<li>` stays a flex child of a gapped row and leaves a hole
              before TERMS OF USE.
            */}
            <li className="empty:hidden">
              <NetworkStatusIndicator
                labels={{ label: t('status.label'), good: t('status.good'), degraded: t('status.degraded') }}
                href={FOOTER_STATUS_URL}
              />
            </li>
            {FOOTER_POLICY_LINKS.map((spec) => ({ spec, label: t(`links.${spec.key}`) }))
              // Same empty-label rule as the nav columns: the Japanese footer
              // carries no accessibility declaration.
              .filter(({ label }) => label.trim() !== '')
              .map(({ spec, label }) => (
                <li key={spec.key}>
                  <FooterLink2 asChild lang={textLang(label, locale)}>
                    <Link href={localeHref(spec.href, locale)}>{label}</Link>
                  </FooterLink2>
                </li>
              ))}
          </ul>

          <div className="flex items-center pb-7 lg:row-start-2 lg:border-l lg:border-neutral-500 lg:pl-6 lg:pt-[3.625rem]">
            <FooterSocials labels={socialLabels} />
          </div>
        </div>
      </div>
    </footer>
  )
}
