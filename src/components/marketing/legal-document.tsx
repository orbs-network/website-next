import Markdown from 'react-markdown'
import { H1, H2, H3 } from '@/app/components/typography'
import { cn } from '@/lib/utils'

/**
 * Renders a legal document from markdown.
 *
 * A server component, so `react-markdown` runs at build and none of it reaches
 * the browser — these pages ship as static HTML.
 *
 * Elements are mapped onto the design system rather than left as bare tags, so
 * a policy page sets type the same way every other page does. `react-markdown`
 * produces React elements from an AST; there is no `dangerouslySetInnerHTML`
 * anywhere in the path, which matters because it keeps the door open to feeding
 * these from a CMS later without revisiting the security question.
 */
/**
 * Adds the trailing slash `trailingSlash: true` makes canonical.
 *
 * The documents were authored with slashless paths, and every one of those
 * costs a 308 on click. Normalised here rather than edited into each document,
 * so a future document cannot reintroduce it.
 *
 * Any hash or query is preserved and the slash goes before it — `/x#y` becomes
 * `/x/#y`, not `/x#y/`, which would be a different and nonexistent URL.
 */
function internalHref(href: string): string {
  const [path, ...rest] = href.split(/(?=[#?])/)

  if (path === '' || path.endsWith('/')) return href

  return `${path}/${rest.join('')}`
}

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
  // Matched at the start of a line, since `#` occurs mid-sentence in legal text.
  const hasOwnHeading = /^#\s/m.test(markdown)

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
        <Markdown
          components={{
            h1: ({ children }) => <H1 className="mb-8">{children}</H1>,
            h2: ({ children }) => <H2>{children}</H2>,
            h3: ({ children }) => <H3>{children}</H3>,
            /*
             * h4-h6 are styled here rather than mapped to `H4`/`H5`.
             *
             * They have to be styled as something: Tailwind's preflight resets
             * every heading to body size, and these documents lean on them —
             * the privacy policy's numbered sections are `h5`, and the
             * Liquidity Hub terms use fifteen more. Left unmapped they are
             * indistinguishable from the paragraphs around them, which is
             * exactly where a reader scans.
             *
             * But the design system's `H5` is `uppercase`, and that is wrong
             * here. Legal documents capitalise deliberately — defined terms,
             * "PLEASE READ CAREFULLY" — and forcing every section heading to
             * caps destroys that distinction and changes how a clause reads.
             * So: heading weight and colour, document case.
             */
            h4: ({ children }) => <h4 className="text-lg font-semibold text-fg">{children}</h4>,
            h5: ({ children }) => <h5 className="text-base font-semibold text-fg">{children}</h5>,
            h6: ({ children }) => <h6 className="text-base font-semibold text-fg">{children}</h6>,
            p: ({ children }) => <p className="leading-relaxed text-fg-muted">{children}</p>,
            ul: ({ children }) => (
              // `ps-6` rather than `pl-6`, so the marker indent follows `dir`.
              <ul className="list-disc space-y-2 ps-6 text-fg-muted">{children}</ul>
            ),
            ol: ({ children }) => <ol className="list-decimal space-y-2 ps-6 text-fg-muted">{children}</ol>,
            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
            strong: ({ children }) => <strong className="font-semibold text-fg">{children}</strong>,
            a: ({ href, children }) => {
              // Legal documents cite outside authorities — regulations, audits,
              // the network terms on GitHub. Anything not starting `/` leaves
              // the site and is treated as such.
              // A bare address as the destination — `[x@y](x@y)` in the
              // legacy markdown — resolves as a RELATIVE PATH, so the contact
              // link on a privacy policy navigated to /hello@orbs.com instead
              // of opening a mail client. Normalised here rather than in each
              // document, since it is a property of the link, not of the copy.
              const resolved = href && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(href) ? `mailto:${href}` : href
              const external = !resolved?.startsWith('/')

              return (
                <a
                  href={external ? resolved : internalHref(resolved as string)}
                  {...(external && !resolved?.startsWith('mailto:')
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                  className="text-accent-primary underline underline-offset-4 hover:text-accent-primary-hover"
                >
                  {children}
                </a>
              )
            },
            // The legacy markdown uses `<br>` for address blocks. Allowed
            // through as a line break and nothing else.
            br: () => <br />,
          }}
        >
          {markdown}
        </Markdown>
      </article>
    </section>
  )
}
