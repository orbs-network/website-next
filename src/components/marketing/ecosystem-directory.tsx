import Image from 'next/image'
import { H1, H2 } from '@/app/components/typography'

export type EcosystemCard = {
  name: string
  url: string
  logo?: string
}

import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

export type EcosystemGroup = {
  key: string
  title: string
  entries: readonly EcosystemCard[]
}

/**
 * The ecosystem directory: categories of projects, each a logo linking out.
 *
 * Every entry is an external link, so each is a plain `<a>` with
 * `rel="noopener noreferrer"` rather than a `next/link`.
 *
 * The logo is decorative and the NAME is the accessible label. A logo grid
 * where each image carries the project name as `alt` reads out the name twice —
 * once for the image, once for the visible text — so the image is `alt=""` and
 * the text does the work. One entry has no logo at all and renders as text
 * alone, which is why the name is always present rather than being replaced by
 * the image.
 */
export function EcosystemDirectory({
  title,
  groups,
  locale,
}: {
  title: string
  groups: readonly EcosystemGroup[]
  /**
   * The document's locale. Each string's own `lang` is derived from it.
   *
   * This replaces a `titleLang` carried on every GROUP, which the page had to
   * compute and set per category. Outside English it was always 'en' — the
   * legacy `jp/` and `ko/` directories hold the English category titles
   * verbatim. Deriving it here says the same thing without the caller having
   * to know, and covers the project names too, which had no `lang` at all.
   */
  locale: Locale
}) {
  return (
    <section className="container mx-auto px-5 pt-16 pb-24">
      <H1 className="mb-16" lang={textLang(title, locale)}>
        {title}
      </H1>

      {groups.map((group) => (
        <div key={group.key} className="mt-16 first:mt-0">
          <H2 className="mb-8" lang={textLang(group.title, locale)}>
            {group.title}
          </H2>

          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {group.entries.map((entry) => (
              <li key={`${group.key}-${entry.name}`}>
                <EcosystemTile entry={entry} locale={locale} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}

/**
 * One project. A link when there is somewhere to go, otherwise plain.
 *
 * Five entries in the dataset carry `url: ''` — Ledger, D'Cent, myNFT.fyi,
 * inboundjunction and Yozma Group. Rendered through an anchor, an empty `href`
 * resolves to the CURRENT page, so each of those cards silently reopened
 * /ecosystem/ in a new tab. A card with no destination should not look or
 * behave like one: no anchor, no hover affordance, no tab stop.
 */
function EcosystemTile({ entry, locale }: { entry: EcosystemCard; locale: Locale }) {
  const tile = 'flex h-full flex-col items-center justify-center gap-3 rounded-sm border border-border p-5 text-center'

  const body = (
    <>
      {/*
        Decorative: the visible name is the accessible label. Giving the image
        the project name as `alt` would have a screen reader announce it twice.
      */}
      {entry.logo && (
        <Image
          src={entry.logo}
          alt=""
          width={96}
          height={40}
          sizes="96px"
          className="h-10 w-auto max-w-[6rem] object-contain"
        />
      )}
      {/*
        The name is the accessible label — the logo beside it is `alt=""` — so
        this is what gets announced. Project names are proper nouns and stay
        Latin in every locale, which is exactly what `textLang` marks. It had
        no `lang` at all before, inheriting whatever the page had guessed.
      */}
      <span className="text-detail font-medium" lang={textLang(entry.name, locale)}>
        {entry.name}
      </span>
    </>
  )

  if (!entry.url) {
    return <div className={tile}>{body}</div>
  }

  return (
    <a
      href={entry.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${tile} transition-colors hover:border-accent-primary hover:text-accent-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring`}
    >
      {body}
    </a>
  )
}
