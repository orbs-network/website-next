import { TelegramIcon, XIcon } from '@/components/icons'
import { Button } from '@/components/ui/button'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'
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
 *
 * **Spacing is the 09-30 home frame's (#225).** Measured from the rule above:
 * the phrases' line box starts 168px down, the buttons 77px below that line,
 * and the band ends 173px below the buttons. The phrases and buttons belong
 * together; the old layout put 310px between them and the buttons floated in
 * the middle of the glow. Tighter below `md`, where 168px is most of a screen.
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

      <Marquee phrases={phrases} locale={locale} className="pb-0 pt-24 md:pt-[10.5rem]" />

      <section className="px-5 pb-24 pt-16 md:pb-[10.8125rem] md:pt-[4.8125rem]">
        {/*
          The design fills each button with 10% white over the glow. Set here
          rather than on each caller's buttons so every page's closing block
          gets it — the actions are direct children.
        */}
        <div className="relative flex flex-wrap items-center justify-center gap-[2.0625rem] [&>*]:bg-white/10">
          {actions}
        </div>
      </section>
    </div>
  )
}

/**
 * "Follow us" (X) and "Join community" (Telegram), with their marks.
 *
 * The home page and dSPOT both close on this pair; the design draws each with
 * its network's mark in place of the arrow. The mark is `aria-hidden` — the
 * label already names the destination, and the icons carry their own
 * `aria-label`, which would otherwise make it "Follow us X".
 */
export function ClosingSocialButtons({
  follow,
  community,
  x,
  telegram,
  locale,
}: {
  follow: string
  community: string
  x: string
  telegram: string
  locale: Locale
}) {
  return (
    <>
      <Button asChild icon={<XIcon aria-hidden className="size-3.5 shrink-0" />}>
        <a href={x} target="_blank" rel="noopener noreferrer" lang={textLang(follow, locale)}>
          {follow}
        </a>
      </Button>
      <Button asChild icon={<TelegramIcon aria-hidden className="size-3.5 shrink-0" />}>
        <a href={telegram} target="_blank" rel="noopener noreferrer" lang={textLang(community, locale)}>
          {community}
        </a>
      </Button>
    </>
  )
}
