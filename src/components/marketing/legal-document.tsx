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
export function LegalDocument({
  markdown,
  lang,
  dir,
}: {
  markdown: string
  /** Set when the document's language differs from the page it is served on. */
  lang?: string
  dir?: 'ltr' | 'rtl'
}) {
  return (
    <section className="container mx-auto px-5 pt-16 pb-24">
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
          '[&>*+*]:mt-4 [&>h2]:mt-12 [&>h3]:mt-8 [&>ul]:mt-4 [&>ol]:mt-4'
        )}
      >
        <Markdown
          components={{
            h1: ({ children }) => <H1 className="mb-8">{children}</H1>,
            h2: ({ children }) => <H2>{children}</H2>,
            h3: ({ children }) => <H3>{children}</H3>,
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
              const external = !href?.startsWith('/')

              return (
                <a
                  href={href}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
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
