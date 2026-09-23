import { ChevronDown } from 'lucide-react'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

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
  locale,
  children,
}: {
  summary: string
  /**
   * The document's locale. The SUMMARY's `lang` is derived from it.
   *
   * The content is not, and cannot be: it is `ReactNode`, so there is no
   * string here to inspect. That is the right split rather than a gap — the
   * caller passes `<MarkdownProse locale={...}>`, which marks each paragraph,
   * list item and heading it renders. Language ends up on the elements
   * holding the text either way, which is the point of #103.
   *
   * It also avoids a wrapper. Hanging a `lang` on the content div would put a
   * new element inside `space-y-4`, whose spacing comes from direct children —
   * a silent visual regression on every FAQ answer.
   */
  locale: Locale
  children: React.ReactNode
}) {
  return (
    <details className="group py-4">
      <summary
        lang={textLang(summary, locale)}
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

      <div className="mt-3 space-y-4 [&_ol]:mt-3 [&_ul]:mt-3">{children}</div>
    </details>
  )
}
