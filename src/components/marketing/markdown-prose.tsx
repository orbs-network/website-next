import * as React from 'react'
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

/**
 * Lets an unbreakable run — a raw URL, a long identifier — wrap anywhere
 * rather than widen its column (#189).
 *
 * A white-paper abstract quotes `https://ieeexplore.ieee.org/document/8486415.`
 * as plain text: 374px with no break opportunity, in a 350px column, which took
 * `/white-papers/` to 394px on a 390px phone and scrolled the page sideways.
 *
 * `anywhere` and not Tailwind's `break-words` (`overflow-wrap: break-word`),
 * and the difference is the whole fix. Both break a long word that overflows
 * its line — but only `anywhere` also shrinks the element's MIN-CONTENT width.
 * The abstract sits in a flex row beside its thumbnail, and a flex item will
 * not shrink below its min-content; under `break-word` the column still
 * insists on being as wide as the URL, and the overflow moves up a level
 * instead of going away. Ordinary words fit their lines, so this changes
 * nothing about how normal prose sets.
 *
 * Shared by both component maps below, which each define `p` and `li` — two
 * copies of a class list is two places for this to be forgotten.
 */
const WRAP = '[overflow-wrap:anywhere]'

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
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className={`leading-relaxed text-fg-muted ${WRAP}`}>{children}</p>
  ),
  // `ps-6` rather than `pl-6`, so the marker indent follows `dir`.
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="list-disc space-y-2 ps-6 text-fg-muted">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="list-decimal space-y-2 ps-6 text-fg-muted">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => <li className={`leading-relaxed ${WRAP}`}>{children}</li>,
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-fg">{children}</strong>
  ),
  a: anchor(),
  // The legacy markdown uses `<br>` for address blocks. Allowed through as a
  // line break and nothing else.
  br: () => <br />,
}

/**
 * The plain text inside a node, flattened.
 *
 * Recursive, unlike the version this replaces, which handled a string or an
 * array of strings and gave up on anything else. That was enough for link
 * labels — they are plain in this copy — but not for a paragraph, which
 * routinely contains a `<strong>` or a link and would therefore have returned
 * `undefined` and gone unlabelled. Since an unlabelled block is precisely the
 * bug (#103), giving up on the common case would have made this cosmetic.
 */
function nodeText(node: React.ReactNode): string | undefined {
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (Array.isArray(node)) {
    const parts = node.map(nodeText)
    return parts.some((part) => part === undefined) ? undefined : parts.join('')
  }
  if (React.isValidElement(node)) {
    return nodeText((node.props as { children?: React.ReactNode }).children)
  }
  // `null`, `undefined` and booleans render nothing, so they contribute
  // nothing rather than defeating the whole extraction.
  if (node === null || node === undefined || typeof node === 'boolean') return ''

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
    const text = locale === undefined ? undefined : nodeText(children)

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

/**
 * Every block element, marked with the language of its own text.
 *
 * NO WRAPPER, and that is the point. Giving this component a `lang` prop would
 * mean rendering a `<div>` to hang it on, which is (a) the wrapper-scope
 * pattern #103 exists to remove, one language guessed for a whole document,
 * and (b) a new element in the middle of `Disclosure`'s `space-y-4`, whose
 * spacing comes from direct children — a silent visual regression on the FAQ.
 *
 * Each paragraph, list item and heading carries its own instead. A legal
 * document is exactly where this matters: the Japanese privacy policy has
 * English defined terms and English company names sitting inside Japanese
 * clauses.
 */
function languageAware(locale: Locale) {
  const marked = <P extends { children?: React.ReactNode }>(render: (props: P, lang?: string) => React.ReactNode) =>
    function Marked(props: P) {
      const text = nodeText(props.children)

      return render(props, text === undefined ? undefined : textLang(text, locale))
    }

  return {
    ...COMPONENTS,
    a: anchor(locale),
    p: marked(({ children }, lang) => (
      <p className={`leading-relaxed text-fg-muted ${WRAP}`} lang={lang}>
        {children}
      </p>
    )),
    li: marked(({ children }, lang) => (
      <li className={`leading-relaxed ${WRAP}`} lang={lang}>
        {children}
      </li>
    )),
    h1: marked(({ children }, lang) => (
      <H1 className="mb-8" lang={lang}>
        {children}
      </H1>
    )),
    h2: marked(({ children }, lang) => <H2 lang={lang}>{children}</H2>),
    h3: marked(({ children }, lang) => <H3 lang={lang}>{children}</H3>),
    h4: marked(({ children }, lang) => (
      <h4 className="text-lg font-semibold text-fg" lang={lang}>
        {children}
      </h4>
    )),
    h5: marked(({ children }, lang) => (
      <h5 className="text-base font-semibold text-fg" lang={lang}>
        {children}
      </h5>
    )),
    h6: marked(({ children }, lang) => (
      <h6 className="text-base font-semibold text-fg" lang={lang}>
        {children}
      </h6>
    )),
  }
}

export function MarkdownProse({ children, locale }: { children: string; locale?: Locale }) {
  // Only build a components object when the caller asked for language-aware
  // output; otherwise reuse the module-level one.
  const components = locale === undefined ? COMPONENTS : languageAware(locale)

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
