/**
 * How long a Contentful rich-text document takes to read, in minutes.
 *
 * The design's news cards show "READ — 4 MINS". Contentful's `blogPost` model
 * has no such field — title, heroImage, content, date, shortDescription, slug,
 * author, and nothing else — so it is derived from the body rather than
 * invented or added to the content model for one label.
 *
 * Derivation is the right call here and not always: a reading time is a
 * function of the text, so computing it cannot drift from the post, while an
 * editor-entered number can and eventually does. The cost is that it is an
 * estimate, which is what the label already claims.
 *
 * 200 words per minute is the conventional figure for online prose. It is a
 * rough instrument either way — the point of the label is "short" versus
 * "long", not a promise.
 */

const WORDS_PER_MINUTE = 200

/**
 * Walks any rich-text shape and concatenates its text.
 *
 * Deliberately structural rather than typed against Contentful's `Document`.
 * The document arrives as a nested tree whose node types grow with the content
 * model — embedded entries, tables, hyperlinks — and this only cares about the
 * leaves that carry a `value`. Matching on shape means a new node type adds its
 * text automatically instead of being silently skipped by a narrower type.
 */
function text(node: unknown): string {
  if (typeof node !== 'object' || node === null) return ''

  const candidate = node as { value?: unknown; content?: unknown }

  if (typeof candidate.value === 'string') return candidate.value

  if (Array.isArray(candidate.content)) {
    return candidate.content.map(text).join(' ')
  }

  return ''
}

/** Minutes, rounded up, never less than one. */
export function readingMinutes(document: unknown): number {
  const words = text(document)
    .split(/\s+/)
    .filter((word) => word !== '').length

  // An empty or unreadable document still reads as "1 min" rather than "0 min",
  // which would be a strange thing to print next to an article. A zero here
  // usually means the body did not resolve, not that the post is empty.
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}
