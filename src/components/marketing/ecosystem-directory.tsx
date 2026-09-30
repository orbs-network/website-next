import Image from 'next/image'
import { H1, H4 } from '@/app/components/typography'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'
import { cn } from '@/lib/utils'
import { Eyebrow } from './section-parts'

export type EcosystemCard = {
  name: string
  url: string
  logo?: string
}

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
 *
 * Laid out on the master (#227): a left-aligned eyebrow and statement for the
 * page head, then one ruled row per category with its title on the left and
 * the tiles beside it. Fifteen categories stacked full-width under 50px
 * headings made the page a scroll of headings; beside the tiles, the title
 * takes a column and the rows stay short.
 */
export function EcosystemDirectory({
  eyebrow,
  headline,
  groups,
  locale,
}: {
  eyebrow: string
  headline: string
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
    <section className="container pt-16 pb-section">
      <Eyebrow text={eyebrow} locale={locale} />
      <H1 className="mt-3 max-w-4xl text-balance" lang={textLang(headline, locale)}>
        {headline}
      </H1>

      {groups.map((group, index) => (
        <div
          key={group.key}
          className={cn(
            'grid grid-cols-1 gap-8 border-t border-border pt-6 pb-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]',
            index === 0 && 'mt-section'
          )}
        >
          {/* An `h2` in the outline, set at `h4` size: fifteen of them run down one column. */}
          <H4 asChild>
            <h2 className="text-balance" lang={textLang(group.title, locale)}>
              {group.title}
            </h2>
          </H4>

          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
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
  const tile = 'flex h-full flex-col items-center justify-center gap-3 border border-border p-5 text-center'

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
