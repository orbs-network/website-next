import Image from 'next/image'
import { getAssetUrl, type MediaMentionFields } from '@/app/lib/api'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { COVER_FRAME } from '@/app/components/blog/cover'
import { cn } from '@/lib/utils'

// These CMS marks have pale lettering. Render them in dark ink so every
// publisher can use the same white backing in both themes.
const WHITE_PUBLISHER_LOGOS = new Set([
  'cryptonews.svg',
  'crypto-news-flash.webp',
  'coinpedia.webp',
  'investing.webp',
  'crypto-briefing.png',
  'zycrypto.png',
  'cryptodaily.svg',
  'ihodi.png', // iHODL's filename in the CMS.
  'orbs.svg',
  'coinquora.svg',
  'cryptopotato.png',
])

/**
 * A press mention links OUT to the publisher — there is no page of our own to
 * navigate to, so this is a plain `<a>` with `target="_blank"`, not a
 * `next/link`.
 */
export function MediaCard({ mention }: { mention: MediaMentionFields }) {
  const thumbnailUrl = getAssetUrl(mention.thumbnail)
  const logoUrl = getAssetUrl(mention.publisherLogo)
  const darkLogoInk = logoUrl && WHITE_PUBLISHER_LOGOS.has(new URL(logoUrl).pathname.split('/').pop()!.toLowerCase())

  return (
    <Card className="p-0 group overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <a
        lang="en"
        href={mention.url}
        target="_blank"
        rel="noopener noreferrer"
        className="h-full flex flex-col"
        // The headline is the accessible name; without this a screen reader
        // announces only "link" for a card whose text sits in a child element.
        aria-label={`${mention.headline} (opens on the publisher's site)`}
      >
        <CardHeader className="p-0 pb-4">
          {/* Match the blog listing: fill the cover frame, cropping as needed. */}
          <div className={cn('relative overflow-hidden', COVER_FRAME)}>
            {thumbnailUrl && (
              <Image
                src={thumbnailUrl}
                alt=""
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              />
            )}
          </div>
        </CardHeader>

        <CardContent className="flex flex-col justify-between h-full gap-4">
          <p className="font-semibold leading-6 transition-colors group-hover:text-link">{mention.headline}</p>

          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {logoUrl && (
              // Decorative: the publisher is already conveyed by the link
              // target and the headline, and the legacy data has no publisher
              // NAME to put in alt text — only a logo filename.
              <span className="inline-flex shrink-0 items-center bg-white px-2 py-1">
                <Image
                  src={logoUrl}
                  alt=""
                  width={72}
                  height={20}
                  className={cn('h-5 w-auto max-w-[6rem] object-contain', darkLogoInk && 'brightness-0')}
                />
              </span>
            )}
            <time dateTime={mention.date}>
              {new Date(mention.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </div>
        </CardContent>
      </a>
    </Card>
  )
}
