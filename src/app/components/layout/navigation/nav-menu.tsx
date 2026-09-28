import { getTranslations } from 'next-intl/server'
import { getFeaturedPost } from '@/app/lib/api'
import { NAV_GROUPS, NAV_TOP_LEVEL_LINKS, type NavLinkSpec } from '@/content/shared/navigation'
import { localeHref } from '@/i18n/availability'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'
import type { FeaturedCopy, ResolvedNavGroup, ResolvedNavLink } from './nav-menu-client'

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
 * The panels have no title and no arrow, which is a DECISION rather than an
 * omission. The designs head each panel with "Products →", implying a landing
 * page for the group — but there is no `/products`, `/solutions` or `/network`
 * page, and none is planned (#30 settled the same question for the previous
 * menu). The group name lives on the dropdown trigger only.
 *
 * The locale is a prop for the same reason as in `Header`: with no `[locale]`
 * segment and no middleware, next-intl's hooks cannot resolve it from the
 * request.
 */
export async function resolveNavigation(locale: Locale) {
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
      children: spec.children?.map(resolveLink),
      desktopOnly: spec.desktopOnly,
    }
  }

  const groups = NAV_GROUPS.map((group): ResolvedNavGroup => {
    const label = t(`groups.${group.key}`)

    return { key: group.key, label, lang: textLang(label, locale), links: group.links.map(resolveLink) }
  })

  const featuredLabel = t('featuredPost')
  const featuredCta = t('featuredPostCta')
  const post = await getFeaturedPost()

  return {
    groups,
    topLevel: NAV_TOP_LEVEL_LINKS.map(resolveLink),
    // Post titles are English whatever the page's locale; `textLang` says so.
    featured: post ? { ...post, titleLang: textLang(post.title, locale) } : null,
    featuredCopy: {
      label: featuredLabel,
      labelLang: textLang(featuredLabel, locale),
      cta: featuredCta,
      ctaLang: textLang(featuredCta, locale),
    } satisfies FeaturedCopy,
  }
}
