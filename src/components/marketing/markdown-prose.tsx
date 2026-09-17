import Markdown from 'react-markdown'
import { H1, H2, H3 } from '@/app/components/typography'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

/**
 * Renders repo-authored markdown as React elements.
 *
 * Shared by the legal documents and the FAQ answers, which need the same
 * element treatment and would otherwise keep two copies of it that drift.
 *
 * A server component in every current caller, so `react-markdown` runs at build
 * and none of it reaches the browser. It produces React elements from an AST —
 * there is no `dangerouslySetInnerHTML` in the path, which keeps the door open
 * to feeding these from a CMS later without revisiting the security question.
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
export function internalHref(href: string): string {
  const [path, ...rest] = href.split(/(?=[#?])/)

  if (path === '' || path.endsWith('/')) return href

  return `${path}/${rest.join('')}`
}

const COMPONENTS = {
  h1: ({ children }: { children?: React.ReactNode }) => <H1 className="mb-8">{children}</H1>,
  h2: ({ children }: { children?: React.ReactNode }) => <H2>{children}</H2>,
  h3: ({ children }: { children?: React.ReactNode }) => <H3>{children}</H3>,
  /*
   * h4-h6 are styled here rather than mapped to `H4`/`H5`.
   *
   * They have to be styled as something: Tailwind's preflight resets every
   * heading to body size, and the legal documents lean on them — the privacy
   * policy's numbered sections are `h5`, and the Liquidity Hub terms use
   * fifteen more. Left unmapped they are indistinguishable from the paragraphs
   * around them, which is exactly where a reader scans.
   *
   * But the design system's `H5` is `uppercase`, and that is wrong here. Legal
   * documents capitalise deliberately — defined terms, "PLEASE READ CAREFULLY"
   * — and forcing every section heading to caps destroys that distinction and
   * changes how a clause reads. So: heading weight and colour, document case.
   */
  h4: ({ children }: { children?: React.ReactNode }) => <h4 className="text-lg font-semibold text-fg">{children}</h4>,
  h5: ({ children }: { children?: React.ReactNode }) => <h5 className="text-base font-semibold text-fg">{children}</h5>,
  h6: ({ children }: { children?: React.ReactNode }) => <h6 className="text-base font-semibold text-fg">{children}</h6>,
  p: ({ children }: { children?: React.ReactNode }) => <p className="leading-relaxed text-fg-muted">{children}</p>,
  // `ps-6` rather than `pl-6`, so the marker indent follows `dir`.
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="list-disc space-y-2 ps-6 text-fg-muted">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="list-decimal space-y-2 ps-6 text-fg-muted">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-fg">{children}</strong>
  ),
  a: anchor(),
  // The legacy markdown uses `<br>` for address blocks. Allowed through as a
  // line break and nothing else.
  br: () => <br />,
}

/** The link's own text, when it is plain — which is every link in this copy. */
function linkText(children: React.ReactNode): string | undefined {
  if (typeof children === 'string') return children
  if (Array.isArray(children) && children.every((child) => typeof child === 'string')) return children.join('')
  return undefined
}

/**
 * The anchor renderer, optionally marking each link with its own language.
 *
 * A link label is an accessible name, and it takes its language from the
 * element carrying it — not from the sentence around it. The Korean copy on
 * `/smart-contracts` is exactly the case that forces this: a Korean sentence
 * introducing a link labelled "Orbs Staking Contract High-Level Specification".
 * The paragraph is correctly `ko`, the anchor inherits it, and a screen reader
 * reads English words with Korean phonetics. See #103, of which this is another
 * instance.
 *
 * `locale` is optional and callers that omit it get exactly the previous
 * markup. This is deliberately not switched on everywhere in the same change —
 * it would alter the rendered output of the legal documents and the FAQ, which
 * deserve their own look rather than riding along with a page port.
 */
function anchor(locale?: Locale) {
  return function Anchor({ href, children }: { href?: string; children?: React.ReactNode }) {
    // A bare address as the destination — `[x@y](x@y)` in the legacy markdown —
    // resolves as a RELATIVE PATH, so the contact link on a privacy policy
    // navigated to /hello@orbs.com instead of opening a mail client. Normalised
    // here rather than in each document, since it is a property of the link.
    const resolved = href && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(href) ? `mailto:${href}` : href
    const external = !resolved?.startsWith('/')
    const text = locale === undefined ? undefined : linkText(children)

    return (
      <a
        href={external ? resolved : internalHref(resolved as string)}
        {...(external && !resolved?.startsWith('mailto:') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        lang={text === undefined ? undefined : textLang(text, locale as Locale)}
        className="text-accent-primary underline underline-offset-4 hover:text-accent-primary-hover"
      >
        {children}
      </a>
    )
  }
}

export function MarkdownProse({ children, locale }: { children: string; locale?: Locale }) {
  // Only build a components object when the caller asked for language-aware
  // links; otherwise reuse the module-level one.
  const components = locale === undefined ? COMPONENTS : { ...COMPONENTS, a: anchor(locale) }

  return <Markdown components={components}>{children}</Markdown>
}

/**
 * Markdown reduced to the words, for places that cannot render elements.
 *
 * A `<meta name="description">` takes text, so passing a raw abstract there
 * published `[TON.Vote](https://ton.vote/) is ...` to search results and social
 * cards. Link labels are kept and their destinations dropped, which is what a
 * reader of a snippet needs; emphasis markers and list bullets go too.
 *
 * Not a markdown parser — it handles the constructs these abstracts actually
 * contain. Anything more would be re-implementing the renderer above to produce
 * a string.
 */
export function plainText(markdown: string): string {
  return markdown
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/\\([*_[\]])/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}
