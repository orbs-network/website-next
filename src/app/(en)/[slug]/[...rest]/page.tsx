import { notFound } from 'next/navigation'

/**
 * 404 catch-all for unmatched multi-segment English paths.
 *
 * `[slug]` covers single-segment URLs (`/nope/`), which is every blog post and
 * most legacy pages. Anything deeper — `/ai/skills/`, which the legacy navbar
 * links to and Phase 3 has not rebuilt — matched no route at all and fell
 * through to a bare error shell with no header, nav or styling.
 *
 * It sits under `[slug]` rather than at the group root because a sibling
 * `[...rest]` would collide with `[slug]` itself: two dynamic routes of the same
 * specificity at one level. Nested, it only takes over once `[slug]` has
 * matched the first segment, so posts and Phase 3 pages are unaffected.
 */
export default function EnglishCatchAll() {
  notFound()
}
