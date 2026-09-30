import { H2 } from '@/app/components/typography'
import { cn } from '@/lib/utils'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

export type Stat = {
  /** Message key and React key. */
  id: string
  /** The figure itself — "$14B+", "30+". */
  value: string
  /** What it counts. */
  label: string
}

/**
 * Headline figures, side by side.
 *
 * A description list, not a grid of divs: each figure is a value and each label
 * is the term it belongs to, and `<dl>` is what says so. A screen reader then
 * announces "Cumulative volume, $14B+" rather than two loose strings whose
 * relationship has to be inferred from where they sit on screen.
 *
 * The value is rendered FIRST visually but is the `<dd>`; `flex-col-reverse`
 * keeps the reading order correct in the markup while showing the figure above
 * its label, which is the emphasis the design wants.
 */
export function StatsRow({
  title,
  stats,
  columns = 3,
  align = 'center',
  locale,
}: {
  /** Optional: the institutional page runs these bare, under the hero. */
  title?: string
  stats: readonly Stat[]
  /** How many across on a wide viewport. Three unless told otherwise. */
  columns?: 3 | 5
  /**
   * `start` is the home page's row: each figure left-aligned at the start of
   * its column, so five of them spread across the full width, with a soft glow
   * behind the one under the pointer (`Stats Container Area on Hover` in the
   * 2026-09-30 frame). Centred is every other caller, and stays the default.
   */
  align?: 'center' | 'start'
  /** The document's locale. Each string's own `lang` is derived from it. */
  locale: Locale
}) {
  return (
    // `overflow-x-clip` for the glow: it reaches past the first and last
    // figures, and even at opacity 0 a pseudo-element that crosses the
    // viewport edge scrolls the page sideways (measured: 20px at 390).
    // `clip`, not `hidden`, so the section does not become a scroll container.
    <section className={cn('container py-20', align === 'start' && 'overflow-x-clip')}>
      {title && (
        <H2 className="mb-12 text-balance text-center" lang={textLang(title, locale)}>
          {title}
        </H2>
      )}

      {/*
        Column count is the caller's, because the right answer depends on how
        many figures there are. Three wraps five stats into a 3+2 that reads as
        two unrelated rows; five wraps three into a sparse line. Default stays
        three — every existing caller has three.
      */}
      <dl
        className={cn(
          'grid gap-10',
          align === 'center' && 'text-center',
          columns === 5 ? 'sm:grid-cols-3 lg:grid-cols-5' : 'sm:grid-cols-3'
        )}
      >
        {stats.map((stat) => (
          <div key={stat.id} className={cn('flex flex-col-reverse gap-2', align === 'start' && STAT_GLOW)}>
            {/*
              The label and the value are marked SEPARATELY, and this pair is
              the clearest case on the site for why. "$14B+" is Latin in every
              locale, while "누적 거래량" beside it is Korean — one `lang` over
              the row has to be wrong about one of them.
            */}
            <dt
              className="text-detail font-medium uppercase tracking-wide text-fg-muted"
              lang={textLang(stat.label, locale)}
            >
              {stat.label}
            </dt>
            <dd className="text-h2 font-normal text-fg" lang={textLang(stat.value, locale)}>
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

/**
 * The hover glow, as a pseudo-element so it costs no markup and cannot catch
 * the pointer. `-z-10` inside `isolate` keeps it behind the figure without
 * escaping the stat and sliding under the section's background. Violet at 35%
 * fading out by the closest side, which is how the frame draws it; decoration
 * only, so there is nothing to show a keyboard user and no focus equivalent.
 */
const STAT_GLOW = [
  'relative isolate',
  "before:pointer-events-none before:absolute before:-inset-x-8 before:-inset-y-8 before:-z-10 before:content-['']",
  'before:bg-[radial-gradient(closest-side,rgba(139,92,246,0.35),transparent)]',
  'before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100',
  'motion-reduce:before:transition-none',
].join(' ')
