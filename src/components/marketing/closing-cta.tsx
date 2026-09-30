import type { Locale } from '@/i18n/locales'
import { Marquee } from './marquee'
import { SectionBackdrop } from './section-backdrop'

/**
 * `10 / CTA / Shared`: the glowing block every 3.4 page closes on — scrolling
 * phrases, then the calls to action, over the brand glow.
 *
 * Lifted out of the home page, which built it first, so the product pages
 * close the same way rather than on a copy that drifts. The design has one
 * `CTA Area` component shared by every frame; this is that.
 *
 * **One glow field, not one per block.** In the design `Orbs Glow Background`
 * is a single layer behind everything here, so the phrases sit on the tinted
 * upper part of the glow rather than on flat black. Anything the caller passes
 * as `children` — the home page's newsletter signup — renders at the TOP of
 * that field, which is where the home design puts it.
 *
 * `actions` is a node rather than a list of links because the callers disagree
 * on what a button is: the home page mixes external social links with an
 * internal contact link, and the product pages mix docs with contact.
 */
export function ClosingCta({
  phrases,
  actions,
  children,
  locale,
}: {
  phrases: readonly string[]
  actions: React.ReactNode
  children?: React.ReactNode
  locale: Locale
}) {
  return (
    <div className="relative isolate overflow-hidden">
      <SectionBackdrop variant="glow" />

      {children}

      <Marquee phrases={phrases} locale={locale} />

      {/*
        `CTA Area` is 518px around a 174px container and the buttons are 42px,
        so the space around them IS the design. Reserving the container's height
        is what makes the block the size it was drawn, rather than padding
        around a thin row.
      */}
      <section className="px-5 py-44">
        <div className="relative flex min-h-[174px] flex-wrap items-center justify-center gap-4">{actions}</div>
      </section>
    </div>
  )
}
