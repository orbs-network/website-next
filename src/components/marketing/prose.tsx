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
export function Prose({ text, className }: { text: string; className?: string }) {
  const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim() !== '')

  return (
    <div className={cn('space-y-4', className)}>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="text-muted-foreground leading-relaxed">
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
