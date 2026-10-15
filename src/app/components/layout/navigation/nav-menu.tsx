import { getTranslations } from 'next-intl/server'
import { navigationForLocale, type NavLinkSpec } from '@/content/shared/navigation'
import { localeHref } from '@/i18n/availability'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'
import type { ResolvedNavGroup, ResolvedNavLink } from './nav-menu-client'

/**
 * Where a menu link points in this locale, and whether that leaves the site.
 *
 * Absolute hrefs pass through untouched; only internal paths reach
 * `localeHref`, which resolves the locale prefix from the availability map and
 * appends the trailing slash. Same rule as the footer's resolver, minus the
 * per-locale override — no menu entry needs one today.
 */
function resolveNavHref(spec: NavLinkSpec, locale: Locale): { href: string; external: boolean } {
  if (!spec.href.startsWith('/')) {
    return { href: spec.href, external: true }
  }

  return { href: localeHref(spec.href, locale), external: false }
}

/**
 * The header menu's copy and destinations, resolved for one locale.
 *
 * Returns data rather than markup because two components render it — the
 * desktop dropdown bar and the mobile panel (#96). Resolving once in `Header`
 * and passing the result to both is what stops them drifting: a link added to
 * `NAV_GROUPS` appears in both or in neither.
 *
 * Every `t()` call happens here and the rendering half is a client component,
 * because Radix's `NavigationMenu` needs state. Resolving labels there instead
 * would put the whole `nav` namespace in the RSC payload of all 456
 * prerendered pages — the constraint already documented on
 * `NextIntlClientProvider` in `RootShell`.
 *
 * The structure comes from the 3.4 designs — see `navigation.ts`.
 *
 * Panel titles are decorative: the design's arrow does not create new
 * landing pages for the menu groups.
 *
 * The locale is a prop for the same reason as in `Header`: with no `[locale]`
 * segment and no middleware, next-intl's hooks cannot resolve it from the
 * request.
 */
export async function resolveNavigation(locale: Locale) {
  const t = await getTranslations({ locale, namespace: 'nav' })
  const spec = navigationForLocale(locale)

  const resolveLink = (spec: NavLinkSpec): ResolvedNavLink => {
    const label = t(`links.${spec.key}`)
    const { href, external } = resolveNavHref(spec, locale)

    return {
      key: spec.key,
      href,
      external,
      label,
      lang: textLang(label, locale),
      icon: spec.icon,
      children: spec.children?.map(resolveLink),
      desktopOnly: spec.desktopOnly,
    }
  }

  const groups = spec.groups.map((group): ResolvedNavGroup => {
    const label = t(`groups.${group.key}`)

    return {
      key: group.key,
      label,
      lang: textLang(label, locale),
      links: group.links.filter((link) => !link.locales || link.locales.includes(locale)).map(resolveLink),
    }
  })

  return {
    groups,
    topLevel: spec.topLevel.map(resolveLink),
  }
}
