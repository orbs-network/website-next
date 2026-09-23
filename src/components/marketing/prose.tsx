import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'
import { cn } from '@/lib/utils'

/**
 * Renders catalog copy that contains paragraph breaks and `**bold**`.
 *
 * The legacy content is markdown, and the parts that survive into the catalogs
 * use exactly two features: blank-line paragraph breaks and bold runs. Pulling
 * in a markdown renderer for that would ship a parser to the browser to handle
 * two constructs, so this splits on blank lines and on `**`.
 *
 * Deliberately NOT `dangerouslySetInnerHTML` — the strings come from message
 * catalogs today, but the point of this component is that it stays safe if a
 * catalog is ever fed from a CMS. Everything below produces React elements from
 * plain text, so there is no HTML injection path.
 */
/**
 * `locale` marks each PARAGRAPH with its own language (#103).
 *
 * Per paragraph rather than once on the wrapper, and that is the whole point.
 * A single `lang` over the wrapper is the pattern #103 exists to remove: it
 * hangs one language over several strings and guesses which they share. These
 * paragraphs come from one catalog entry, so they usually do share — but
 * "usually" is exactly the assumption that put Korean copy under `lang="en"`
 * six times, and a block of Korean prose quoting an English sentence is an
 * ordinary thing for this content to contain.
 *
 * Optional, and omitting it produces exactly the previous markup. That mirrors
 * the deliberate choice already made in `MarkdownProse`: switching every
 * caller on in one change would alter the rendered output of the legal
 * documents, the FAQ and the footer, which deserve their own look rather than
 * riding along with a refactor.
 */
export function Prose({ text, className, locale }: { text: string; className?: string; locale?: Locale }) {
  const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim() !== '')

  return (
    <div className={cn('space-y-4', className)}>
      {paragraphs.map((paragraph, index) => (
        <p
          key={index}
          className="text-muted-foreground leading-relaxed"
          lang={locale === undefined ? undefined : textLang(paragraph.trim(), locale)}
        >
          {renderBold(paragraph.trim())}
        </p>
      ))}
    </div>
  )
}

/**
 * Splits on `**` and emboldens the odd-indexed segments.
 *
 * An odd number of markers means the last one is never closed. Left alone, the
 * odd-index rule would embolden everything from it to the end of the paragraph —
 * one stray marker silently restyling the rest of the copy. Instead the unclosed
 * marker is restored as literal text, so a malformed catalog entry looks wrong
 * where the mistake is rather than changing how the paragraph reads.
 */
function renderBold(text: string) {
  const segments = text.split('**')

  // `split` yields markers + 1 segments, so an even count means an odd number of
  // markers — the final one is unmatched.
  if (segments.length % 2 === 0) {
    const unclosed = segments.pop() as string
    segments[segments.length - 1] += `**${unclosed}`
  }

  return segments.map((segment, index) =>
    index % 2 === 1 ? <strong key={index}>{segment}</strong> : <span key={index}>{segment}</span>
  )
}
