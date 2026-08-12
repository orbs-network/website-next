import { createHash, timingSafeEqual } from 'node:crypto'

/**
 * Constant-time shared-secret comparison.
 *
 * Both sides are hashed to a fixed 32 bytes before comparison. A naive
 * `a.length !== b.length` guard returns faster for wrong-length inputs, which
 * leaks the secret's length to anyone able to sample a public endpoint enough
 * times to measure it. Hashing first removes the length branch entirely, so
 * every comparison costs the same regardless of input.
 */
export function secretMatches(provided: string | null | undefined, expected: string): boolean {
  if (!provided) return false

  const a = createHash('sha256').update(provided).digest()
  const b = createHash('sha256').update(expected).digest()

  return timingSafeEqual(a, b)
}

/**
 * Is this slug safe to interpolate into a path we redirect to?
 *
 * `blogPost.slug` has no validation in the Contentful content model, so any
 * value read from an entry or a query param is untrusted. The danger is a slug
 * like `//attacker.tld`, which builds the path `///attacker.tld` — browsers
 * resolve that as a protocol-relative external URL.
 *
 * This deliberately checks for redirect safety, NOT for conformance to the
 * `[a-z0-9-]` shape the migration script happens to produce. An editor typing
 * `perpetual-hub-2.0` or `my_post` creates a slug the `[slug]` route serves
 * perfectly well, and rejecting it here would break preview and drop targeted
 * revalidation for that post.
 *
 * The allowlist is the RFC 3986 "unreserved" set (ALPHA / DIGIT / - . _ ~) —
 * precisely the characters that carry no special meaning in a path segment,
 * which rules out `/`, `\`, `:` and `%` without guessing at naming conventions.
 */
const UNRESERVED_ONLY = /^[A-Za-z0-9._~-]+$/

export function isValidSlug(slug: string): boolean {
  if (slug.length === 0 || slug.length > 256) return false
  // Dot segments resolve to the parent/current directory rather than a page.
  if (slug === '.' || slug === '..') return false

  return UNRESERVED_ONLY.test(slug)
}
