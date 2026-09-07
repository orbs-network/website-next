import Link from 'next/link'
import { FooterLink1 } from '@/components/ui/footer-link'
import type { FooterLinkSpec } from '@/content/shared/footer'
import { localeHref } from '@/i18n/availability'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

/**
 * A link with its label already resolved from the catalog.
 *
 * Labels are looked up once in `Footer` rather than in each column. That keeps
 * every `getTranslations` call — and so every reason this tree would have to be
 * async — at the one boundary that is already a server component, which is what
 * lets the pieces below be plain functions with stories.
 */
export type FooterNavItem = {
  spec: FooterLinkSpec
  label: string
}

/**
 * Where a footer link actually points in this locale, and whether that is off
 * this site.
 *
 * Three cases, and the order matters. A per-locale override wins outright — the
 * Japanese and Korean "Blog" entries go to Medium, and running those through
 * `localeHref` would try to localise an absolute URL. Otherwise an absolute
 * `href` is external and passes through untouched. Only an internal path reaches
 * `localeHref`, which is the one case it is for.
 *
 * `external` is derived from the RESOLVED href rather than from the spec, so an
 * override that points off-site is external even though the entry it overrides
 * is internal. That is exactly the blog case: `/blog` is internal, its Japanese
 * destination is not.
 */
export function resolveFooterHref(spec: FooterLinkSpec, locale: Locale): { href: string; external: boolean } {
  const override = spec.localeHref?.[locale]

  if (override !== undefined) {
    return { href: override, external: !override.startsWith('/') }
  }

  if (!spec.href.startsWith('/')) {
    return { href: spec.href, external: true }
  }

  return { href: localeHref(spec.href, locale), external: false }
}

/**
 * One footer link, routed or not depending on where it goes.
 *
 * Internal links go through `next/link` via `asChild` so in-site navigation
 * stays client-side; external ones are plain anchors opening in a new tab.
 * `rel="noopener noreferrer"` on the external branch is not decoration — without
 * `noopener` the opened page gets a handle on this one via `window.opener`.
 */
export function FooterNavLink({ label, locale, spec }: FooterNavItem & { locale: Locale }) {
  const { href, external } = resolveFooterHref(spec, locale)
  const lang = textLang(label, locale)

  if (external) {
    return (
      <FooterLink1 href={href} target="_blank" rel="noopener noreferrer" lang={lang}>
        {label}
      </FooterLink1>
    )
  }

  return (
    <FooterLink1 asChild lang={lang}>
      <Link href={href}>{label}</Link>
    </FooterLink1>
  )
}

/**
 * A titled column of links.
 *
 * The column headings stay English in every locale because the legacy site left
 * them that way — `title: POWERED BY ORBS` is identical in the Japanese and
 * Korean footer files. They are still catalog entries rather than literals, so
 * translating them later is a catalog edit and not a code change.
 *
 * An item whose label is empty is dropped. That is how this codebase expresses
 * "this locale omits the link" (see `ArchitectureSection`): the Japanese footer
 * has no accessibility declaration, and one shared column list with an empty
 * catalog value says so without forking `FOOTER_COLUMNS` three ways.
 */
export function FooterNavColumn({
  id,
  title,
  items,
  locale,
}: {
  /** Ties the heading to its `<nav>` via `aria-labelledby`. */
  id: string
  title: string
  items: readonly FooterNavItem[]
  locale: Locale
}) {
  const visible = items.filter((item) => item.label.trim() !== '')

  return (
    <nav aria-labelledby={id}>
      <h2 id={id} lang={textLang(title, locale)} className="text-detail font-semibold uppercase tracking-wide text-fg">
        {title}
      </h2>

      <ul className="mt-4 space-y-3">
        {visible.map((item) => (
          <li key={item.spec.key}>
            <FooterNavLink {...item} locale={locale} />
          </li>
        ))}
      </ul>
    </nav>
  )
}
