import resolveResponse from 'contentful-resolve-response'
import type { Entry } from 'contentful'
import type { TypeBlogPostSkeleton, TypeMediaMentionSkeleton } from '../generated-types'

/**
 * The published archive as captured by `scripts/snapshot-contentful.mjs`.
 *
 * What a build reads when Contentful will not answer — quota exhausted (402),
 * rate limited (429) or down (5xx). Without it the whole site cannot deploy
 * while the space is unavailable, including changes that have nothing to do
 * with the blog: in November 2026 the organisation hit its monthly API cap and
 * Contentful blocked delivery for the rest of the month.
 *
 * The files hold raw CDA responses (`items` + `includes`) and are resolved here
 * with the same resolver and options the SDK applies to a live response, so an
 * entry from the snapshot has exactly the shape `getEntries` returns.
 *
 * Read with `fs` rather than imported: TypeScript would otherwise infer a type
 * for 6 MB of JSON on every typecheck. Read at build, and at request time by
 * `getPostBySlug` for posts that were not prerendered, so `next.config.ts`
 * traces the directory into the deployment.
 *
 * `fs` and `path` come from `process.getBuiltinModule`, not static imports:
 * `api.ts` is also imported by components that Storybook bundles for the
 * browser (`news-card.tsx`), and Vite cannot bundle a static `node:fs` import.
 * The loader only ever runs on the server.
 *
 * Refresh with `npm run snapshot-content` while Contentful is available. A
 * stale snapshot only matters when a build falls back to it: posts published
 * after the capture are then missing from that deployment until it is rebuilt.
 */

export type SnapshotPost = Entry<TypeBlogPostSkeleton, undefined, string>
export type SnapshotMention = Entry<TypeMediaMentionSkeleton, undefined, string>

export type ContentfulSnapshot = {
  capturedAt: string
  /** Newest first, in the order of api.ts `POST_ORDER`. */
  posts: SnapshotPost[]
  /** Newest first, `-fields.date, sys.id`. */
  mentions: SnapshotMention[]
}

type RawResponse = { capturedAt: string; total: number; items: unknown[] }

function readResolved<T>(file: string): { capturedAt: string; items: T[] } {
  const { readFileSync } = process.getBuiltinModule('node:fs')
  const { join } = process.getBuiltinModule('node:path')
  const path = join(process.cwd(), 'src/app/lib/contentful-snapshot', file)
  const raw = JSON.parse(readFileSync(path, 'utf8')) as RawResponse
  const items = resolveResponse(raw, { removeUnresolved: false, itemEntryPoints: ['fields'] }) as T[]
  if (items.length !== raw.total) {
    throw new Error(`[contentful-snapshot] ${file} holds ${items.length} items but records a total of ${raw.total}.`)
  }
  return { capturedAt: raw.capturedAt, items }
}

let loaded: ContentfulSnapshot | null = null

/** Parsed once per process, on first use. */
export function loadSnapshot(): ContentfulSnapshot {
  if (!loaded) {
    const posts = readResolved<SnapshotPost>('blog-posts.json')
    const mentions = readResolved<SnapshotMention>('media-mentions.json')
    loaded = { capturedAt: posts.capturedAt, posts: posts.items, mentions: mentions.items }
  }
  return loaded
}
