import { H1 } from '@/app/components/typography'
import { cn } from '@/lib/utils'
import { MarkdownProse } from './markdown-prose'

/**
 * Renders a legal document from markdown.
 *
 * A server component, so the markdown parser runs at build and none of it
 * reaches the browser — these pages ship as static HTML. The element treatment
 * lives in `MarkdownProse`, shared with the FAQ answers.
 */
export function LegalDocument({
  markdown,
  title,
  lang,
  dir,
}: {
  markdown: string
  /**
   * The page's title, rendered as the `h1` when the document has none of its
   * own.
   *
   * Only the privacy policy opens with `#`. The two terms documents start at
   * `##` and the accessibility declaration has no headings at all — it uses
   * bold runs — so those three pages had no `h1`, which leaves screen-reader
   * heading navigation with nothing to land on and gives the page no
   * document-level heading for search.
   */
  title: string
  /** Set when the document's language differs from the page it is served on. */
  lang?: string
  dir?: 'ltr' | 'rtl'
}) {
  /*
    Matched at the start of a line, since `#` occurs mid-sentence in legal text
    — and the heading must have TEXT after it.

    `/^#\s/m` also matched a bare `#` on its own line, because `\s` includes the
    newline. The dTWAP disclaimer opens with exactly that, an empty heading left
    over from the legacy content, so the document was judged to supply its own
    `h1`, the catalog title was suppressed, and the page rendered an empty `h1`
    with nothing for heading navigation to land on. The legacy page has the same
    hole; there is no reason to carry it forward.

    Still ONLY `#`, not `##`. The two terms documents and the grant terms open
    at `##` and depend on the catalog title for their `h1` — broadening this to
    any heading level would silently take that away from them, which is a worse
    bug than the one being fixed.
  */
  const hasOwnHeading = /^#[ \t]+\S/m.test(markdown)

  return (
    <section className="container mx-auto px-5 pt-16 pb-24">
      {/*
        Deliberately OUTSIDE the article, which is where `lang` and `dir` live.
        The title comes from the message catalog in the ROUTE's language, while
        the document may be in another — the accessibility declaration is
        Hebrew but titled in English. Inside the article it would inherit
        `lang="he" dir="rtl"` and be announced as Hebrew, set right-aligned.
      */}
      {!hasOwnHeading && <H1 className="mx-auto mb-8 max-w-3xl">{title}</H1>}

      <article
        lang={lang}
        dir={dir}
        className={cn(
          'mx-auto max-w-3xl',
          // `text-start`, not `text-left`: with `dir="rtl"` the logical property
          // flips and Hebrew sets from the right, which a physical `left` would
          // not do.
          'text-start',
          // Spacing lives here rather than on each mapped element so the rhythm
          // is described once, in document order.
          '[&>*+*]:mt-4 [&>h2]:mt-12 [&>h3]:mt-8 [&>h4]:mt-8 [&>h5]:mt-6 [&>h6]:mt-6 [&>ul]:mt-4 [&>ol]:mt-4'
        )}
      >
        <MarkdownProse>{markdown}</MarkdownProse>
      </article>
    </section>
  )
}
