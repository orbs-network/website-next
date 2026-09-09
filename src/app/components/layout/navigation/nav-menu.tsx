import { getTranslations } from 'next-intl/server'
import { NAV_GROUPS, NAV_TOP_LEVEL_LINKS, type NavLinkSpec } from '@/content/shared/navigation'
import { localeHref } from '@/i18n/availability'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'
import { NavMenuClient, type ResolvedNavLink } from './nav-menu-client'

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
 * The header menu, resolved for one locale.
 *
 * Every `t()` call happens here and the rendering half is a client component,
 * because Radix's `NavigationMenu` needs state. Resolving labels there instead
 * would put the whole `nav` namespace in the RSC payload of all 456
 * prerendered pages — the constraint already documented on
 * `NextIntlClientProvider` in `RootShell`.
 *
 * The structure comes from the dropdown designs, not the legacy navbar. The old
 * menu is Overview / Resources / Community with ~29 links; the designs are
 * Products / Resources / Developers with a much shorter list each, so the
 * legacy menu is deliberately not ported wholesale — see `navigation.ts`.
 *
 * NOTE: the designs put an arrow beside each panel's title, implying the group
 * name links to a landing page (`/products`, `/resources`, `/developers`). No
 * such pages exist or appear anywhere in the migration plan, so the title
 * renders as the dropdown trigger only and no arrow-link is invented. Raised
 * on #30 for a decision.
 *
 * The locale is a prop for the same reason as in `Header`: with no `[locale]`
 * segment and no middleware, next-intl's hooks cannot resolve it from the
 * request.
 */
export async function NavMenu({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'nav' })

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
    }
  }

  const groups = NAV_GROUPS.map((group) => {
    const groupLabel = t(`groups.${group.key}`)

    return {
      key: group.key,
      label: groupLabel,
      lang: textLang(groupLabel, locale),
      sections: group.sections.map((section) => {
        const sectionLabel = section.key ? t(`sections.${section.key}`) : undefined

        return {
          key: section.key,
          label: sectionLabel,
          labelLang: sectionLabel ? textLang(sectionLabel, locale) : undefined,
          links: section.links.map(resolveLink),
        }
      }),
    }
  })

  return <NavMenuClient groups={groups} topLevel={NAV_TOP_LEVEL_LINKS.map(resolveLink)} />
}
