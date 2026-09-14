import { ChevronDown } from 'lucide-react'

/**
 * One collapsed section: a summary line, and content behind it.
 *
 * Native `<details>`/`<summary>` rather than a JS accordion. The browser
 * supplies the expanded state, keyboard handling and the correct screen-reader
 * announcement for free, and it all works before hydration — these pages
 * otherwise ship no client JavaScript.
 *
 * It also keeps the content findable by the browser's own in-page search, which
 * expands a closed `<details>` to reveal a match. A JS accordion hides its
 * content from that entirely, which on an FAQ is the whole point of the page.
 *
 * Lifted out of the FAQ when the Proof of Stake page needed the same thing for
 * its explainers — two copies of a disclosure is two places to get the marker
 * and the focus ring wrong.
 */
export function Disclosure({
  summary,
  summaryLang,
  lang,
  children,
}: {
  summary: string
  /** Set when the summary's language differs from the page's. */
  summaryLang?: string
  /** Set when the content's language differs from the page's. */
  lang?: string
  children: React.ReactNode
}) {
  return (
    <details className="group py-4">
      <summary
        lang={summaryLang}
        className={[
          // `list-none` plus the WebKit pseudo-element: the default triangle
          // marker cannot be styled and sits misaligned against a multi-line
          // summary, so it is replaced by the chevron below.
          'flex cursor-pointer list-none items-start justify-between gap-4',
          'font-medium text-fg [&::-webkit-details-marker]:hidden',
          'hover:text-accent-primary',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        ].join(' ')}
      >
        {summary}
        <ChevronDown
          className="mt-1 size-4 shrink-0 transition-transform group-open:rotate-180"
          aria-hidden
          focusable="false"
        />
      </summary>

      <div lang={lang} className="mt-3 space-y-4 [&_ol]:mt-3 [&_ul]:mt-3">
        {children}
      </div>
    </details>
  )
}
