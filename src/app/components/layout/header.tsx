import { Button } from '@/components/ui/button'
import { OrbsLogo } from '@/components/icons'
import { FOOTER_SOCIALS } from '@/content/shared/footer'
import { localeHref } from '@/i18n/availability'
import { localePath, type Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { ThemeToggle } from '../theme/theme-toggle'
import { LanguageSelector } from './language-selector'
import { MobileNav } from './navigation/mobile-nav'
import { NavMenuClient } from './navigation/nav-menu-client'
import { resolveNavigation } from './navigation/nav-menu'

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
  const nav = await getTranslations({ locale, namespace: 'nav' })
  const footerT = await getTranslations({ locale, namespace: 'footer' })
  // Resolved once and handed to both navs, so the desktop bar and the mobile
  // panel cannot list different things.
  const { groups, topLevel } = await resolveNavigation(locale)
  const cta = { label: t('talkToTheTeam'), href: localeHref('/contact', locale) }
  // The mobile panel's footer area repeats the page footer's status, contact
  // and socials, so it reads the page footer's strings rather than copies.
  const mobileFooter = {
    status: { label: footerT('status.label'), good: footerT('status.good'), degraded: footerT('status.degraded') },
    contactLabel: footerT('links.contact'),
    socialLabels: Object.fromEntries(FOOTER_SOCIALS.map((social) => [social.key, footerT(`socials.${social.key}`)])),
  }

  return (
    <nav className="sticky top-0 z-50">
      {/*
        The bar's background, on its own layer rather than on the <nav>.

        90% of the page colour under a heavy blur. The header frame draws 20%
        (#230), which only holds over the page colour, where the two are
        indistinguishable. Over home's `.band-contrast` bands — the page colour
        of the other theme — 20% left the nav text at about 2.2:1 in light and
        white on light grey in dark (#228); the accent active link needs ~88%
        to clear 4.5:1 there. `color-mix` rather than `bg-bg/90`: the
        tokens are bare `var()`s, and Tailwind v3 silently emits nothing for an
        opacity modifier on one (#237).

        A separate element because `backdrop-filter` makes the element carrying
        it the containing block for `position: fixed` descendants, and the
        dropdown's page overlay is one — on the <nav> it would have been
        clipped to the bar.
      */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[color-mix(in_srgb,var(--color-bg)_90%,transparent)] backdrop-blur-[50px]"
      />
      <div className="container">
        {/*
          The rule is on this row, not the <nav>, so it is inset to the page
          gutters the way the design draws it rather than running full-bleed.
          60px on a phone, 100px once the full bar shows.
        */}
        <div className="flex h-[3.75rem] items-center justify-between border-b border-neutral-400 dark:border-neutral-600 xl:h-[6.25rem]">
          <Link
            href={localePath(locale, '/')}
            aria-label={t('homeLink')}
            // Decided from the string, not the locale: `homeLink` is "Orbs home"
            // in Japanese but "Orbs 홈" in Korean, so only one of them needs it.
            lang={textLang(t('homeLink'), locale)}
            // Wordmark in `fg`, accent on hover — the design's #121214 / #F6F6F6
            // / #3346F2. It was Tailwind greys that went grey on hover.
            className="text-fg transition-colors hover:text-accent-primary"
          >
            {/*
              The lockup contains the word "Orbs", which inside a link that
              already carries an `aria-label` would be a second piece of content
              in one link — so it is hidden and the link keeps one accessible
              name. Sized by font size: the lockup scales its mark from `em`.
              Half size on the 60px bar — the mobile frames draw it 50x15.
            */}
            <OrbsLogo className="text-[0.625rem] xl:text-xl" aria-hidden />
          </Link>

          {/*
            The dropdown bar needs roughly 1,100px beside the logo and the call
            to action — seven entries since 3.4 — so it is hidden below `xl`
            and the panel takes over. At `lg` it fitted only by wrapping "Talk
            to the team" onto three lines. Without the panel at all, the
            document once laid out at 880px inside a 390px viewport and every
            page scrolled sideways (#96).
          */}
          <div className="hidden h-full xl:block">
            <NavMenuClient groups={groups} topLevel={topLevel} />
          </div>

          <div className="flex items-center gap-6">
            {/*
              Theme and language are in the panel below `xl`, beside its call
              to action — the mobile frames draw the header as the logo and the
              burger alone (#230).
            */}
            <div className="hidden items-center gap-6 xl:flex">
              <ThemeToggle />
              <LanguageSelector />
            </div>
            {/*
              A link, not a button: it goes somewhere. It was a bare
              `<Button>` with no handler, so it looked like the site's main
              call to action and did nothing when pressed.
            */}
            <Button asChild className="hidden whitespace-nowrap sm:inline-flex">
              <Link href={cta.href} lang={textLang(cta.label, locale)}>
                {cta.label}
              </Link>
            </Button>

            {/* Counterpart to the dropdown bar's `hidden xl:block` above. */}
            <div className="xl:hidden">
              <MobileNav
                groups={groups}
                topLevel={topLevel}
                locale={locale}
                label={nav('menuLabel')}
                title={nav('menuTitle')}
                closeLabel={nav('menuClose')}
                cta={cta}
                settings={
                  <>
                    <ThemeToggle />
                    <LanguageSelector />
                  </>
                }
                footer={mobileFooter}
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
