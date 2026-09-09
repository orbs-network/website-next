import type { HTMLAttributes } from 'react'
import { OrbsMark } from './orbs-mark'
import type { BrandVariant } from './types'

type OrbsLogoProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BrandVariant
}

/**
 * The Orbs lockup: the brand mark followed by the wordmark.
 *
 * Replaces a placeholder that drew three plain circles and set the wordmark as
 * an SVG `<text>` node. The text node was the worse half of that: it rendered
 * only if Montserrat had loaded, fell back to whatever the system offered when
 * it had not, and spaced differently across platforms — a wordmark that is not
 * the same shape twice. As HTML text it inherits the page font like every other
 * string on the site.
 *
 * A `<span>` rather than an `<svg>`, matching the product lockups in
 * `icons/products`: mark and label are siblings, so the label is real text that
 * can be selected, translated and read aloud rather than a glyph outline.
 *
 * Sized by FONT SIZE, not by width. The mark is `1.4em`, so `text-2xl` on the
 * caller scales both parts together and they cannot drift apart — which a
 * `w-48 h-auto` on an svg could not guarantee once the wordmark stopped being
 * part of that svg.
 *
 * The mark is `aria-hidden` here because the wordmark beside it already says
 * "Orbs"; leaving its `role="img"` exposed would name one lockup twice (#84).
 * That also makes this safe to use standalone — the visible text carries the
 * name — while callers that wrap it in an already-labelled link pass
 * `aria-hidden` on the lockup itself.
 */
export function OrbsLogo({ variant = 'color', className, ...rest }: OrbsLogoProps) {
  const classes = [
    // Weight and gap are both taken from the legacy lockup rather than guessed.
    //
    // The legacy `.logo` declares no `font-weight`, so its wordmark inherits the
    // normal 400 of a `<p>` — this was `font-bold`, which is why it read heavy
    // beside the mark.
    //
    // Its gap is `15px` at a `17px` font, i.e. ~0.88em. `gap-2` here was a fixed
    // 8px — both too tight AND unable to scale, since the lockup is sized by
    // font size. `0.6em` sits deliberately between the two: looser than this
    // was, tighter than the legacy, and it now tracks the type size so the
    // header and the hero stay in proportion.
    'inline-flex items-center gap-[0.6em] font-normal uppercase leading-none tracking-wider',
    // The wordmark is HTML text, so unlike the mark it does not take a fill
    // from the variant — it inherits whatever colour surrounds it. Without
    // this, `variant="white"` produced a white mark beside a wordmark in the
    // ambient text colour: half a logo, and unreadable on the dark backgrounds
    // that variant exists for. `color` and `dark` both want the inherited
    // colour, so only `white` overrides.
    variant === 'white' ? 'text-white' : undefined,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={classes} {...rest}>
      <OrbsMark variant={variant} aria-hidden focusable="false" className="size-[1.4em] shrink-0" />
      <span>Orbs</span>
    </span>
  )
}
