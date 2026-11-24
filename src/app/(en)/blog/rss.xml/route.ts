import { getAssetUrl, getAuthorInfo, getPosts, type BlogPostFields } from '@/app/lib/api'
import { BLOG_INDEX_PATH, RSS_PATH, encodedPostPath } from '@/app/lib/routes'
import { absoluteUrl, siteUrl } from '@/app/lib/site'
import { escapeXml } from '@/app/lib/xml'

/**
 * RSS feed at the legacy URL.
 *
 * `/blog/rss.xml` is where the Cuttlebelle site has published for years and is
 * what every existing subscriber polls. It must not move.
 *
 * Generated from Contentful rather than by parsing built HTML, which is what
 * the old `build-rss-feed.js` did.
 *
 * ISR: prerendered at build, served from the ISR cache, and regenerated at
 * most once a day, or as soon as the Contentful webhook (`api/revalidate`)
 * reports a publish. A failed regeneration keeps serving the last good feed.
 *
 * It used to be rendered per request behind a CDN `Cache-Control` header, on
 * the theory that the CDN would absorb polling. It did for browsers, but not
 * for a news aggregator that polled every five seconds from November 2026 and
 * missed the CDN on every request: each poll was a Contentful call, about
 * 17,000 a day, and it pushed the organisation over its monthly API quota.
 * With ISR a request
 * that misses the CDN is answered from the stored render, so no client can
 * drive Contentful traffic however it asks.
 *
 * Freshness, the old reason for staying dynamic, now comes from the webhook
 * rather than from a short CDN lifetime, so a new post appears in the feed as
 * soon as it is published instead of up to a day later.
 */
export const revalidate = 86400

/** Matches the legacy channel metadata so readers see no change. */
const FEED_TITLE = 'THE ORBS PROJECT BLOG'
const FEED_DESCRIPTION = 'Thoughts about the Orbs project, open source, blockchain and engineering.'

/**
 * The legacy feed carried all 451 posts — 342 KB, and an artifact of the old
 * generator dumping everything rather than a deliberate choice. Readers retain
 * items they have already seen, so a bounded window costs subscribers nothing
 * and makes the feed ~30x smaller.
 */
const FEED_ITEM_LIMIT = 50

/**
 * CDATA cannot contain the terminator itself; the standard trick is to split it
 * across two sections. Post bodies are author-written, so this is not
 * hypothetical.
 */
function cdata(value: string): string {
  return `<![CDATA[${value.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`
}

function rfc822(date: string): string {
  return new Date(date).toUTCString().replace('GMT', '+0000')
}

function guessMimeType(url: string): string {
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase()
  if (ext === 'png') return 'image/png'
  if (ext === 'gif') return 'image/gif'
  if (ext === 'webp') return 'image/webp'
  if (ext === 'svg') return 'image/svg+xml'
  return 'image/jpeg'
}

function renderItem(post: BlogPostFields): string {
  const author = getAuthorInfo(post.author)
  const heroUrl = getAssetUrl(post.heroImage)
  const slug = post.slug as string

  // link is canonical (trailing slash); guid deliberately is NOT.
  //
  // The legacy feed emitted slashless URLs as guid, and readers dedupe on guid.
  // Changing it would make all 451 posts reappear as unread for every existing
  // subscriber — so the guid keeps the legacy spelling while the link points at
  // the canonical URL, avoiding a redirect hop for anyone who clicks through.
  const canonical = absoluteUrl(encodedPostPath(slug))
  const legacyGuid = `${siteUrl}/${encodeURIComponent(slug)}`

  const parts = [
    '    <item>',
    `      <title>${cdata(post.title)}</title>`,
    `      <description>${cdata(post.shortDescription || '')}</description>`,
    `      <link>${escapeXml(canonical)}</link>`,
    `      <guid isPermaLink="true">${escapeXml(legacyGuid)}</guid>`,
  ]

  if (author?.name) {
    parts.push(`      <dc:creator>${cdata(author.name)}</dc:creator>`)
  }

  parts.push(`      <pubDate>${rfc822(post.date)}</pubDate>`)

  if (heroUrl) {
    parts.push(`      <enclosure url="${escapeXml(heroUrl)}" length="0" type="${guessMimeType(heroUrl)}"/>`)
  }

  parts.push('    </item>')
  return parts.join('\n')
}

export async function GET() {
  const { items } = await getPosts({ skip: 0, limit: FEED_ITEM_LIMIT })

  const feedUrl = absoluteUrl(RSS_PATH)
  const blogUrl = absoluteUrl(BLOG_INDEX_PATH)
  const lastBuild = items.length > 0 ? rfc822(items[0].date) : new Date().toUTCString().replace('GMT', '+0000')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
  <channel>
    <title>${cdata(FEED_TITLE)}</title>
    <description>${cdata(FEED_DESCRIPTION)}</description>
    <link>${escapeXml(blogUrl)}</link>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml"/>
${items
  .filter((post) => post.slug)
  .map(renderItem)
  .join('\n')}
  </channel>
</rss>
`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  })
}
