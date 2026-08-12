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
 * This is a DENYLIST of what breaks routing or redirect safety, not an
 * allowlist of tidy-looking slugs. An allowlist was tried and was wrong: the
 * legacy archive contains live URLs that a conservative pattern rejects, and
 * these all return 200 on production today:
 *
 *   /Orbs-Farming-&-Single-Stake-Goes-Live-on-Pangolin/
 *   /How-to-Use-the-Orbs-Fossil-Farms-&-Extinction-Pool-on-DinoSwap/
 *   ...plus two whose titles are separated by U+200A hair spaces
 *
 * `&` is a valid sub-delim in an RFC 3986 path segment, and non-ASCII is fine
 * once percent-encoded. Neither can escape the path, so neither is our problem.
 *
 * NB: do not reach for `\s` here. In JavaScript it matches U+2000–U+200A, so
 * it would reject the two live hair-space slugs above.
 */
export function isValidSlug(slug: string): boolean {
  if (slug.length === 0 || slug.length > 256) return false

  // Dot segments resolve to the parent/current directory rather than a page.
  if (slug === '.' || slug === '..') return false

  // Rejects, in order:
  //   /  \   path separators — protocol-relative escape and traversal
  //   ?  #   URL component separators. `redirect(postPath(slug))` would treat
  //          a slug of `foo?bar` as path `/foo` plus a query string, opening
  //          the wrong page rather than the entry we just looked up.
  //   %      percent-encoding ambiguity; we encode at the boundary, so a
  //          literal one is always a mistake
  //   \x00-\x20 \x7F  ASCII control characters and space
  //
  // Deliberately ASCII-only, so U+200A survives.
  return !/[/\\?#%\x00-\x20\x7F]/.test(slug)
}
