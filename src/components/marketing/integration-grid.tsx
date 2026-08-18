import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { H2, H3 } from '@/app/components/typography'
import type { Integration } from '@/content/pages/dtwap'
import Image from 'next/image'

/**
 * Partner DEXes that have shipped the protocol, each with a screenshot of it
 * running on their own site.
 *
 * The legacy version put every screenshot behind a click. They are the evidence
 * that the integrations are real, so they render inline instead — `next/image`
 * makes that affordable, which it was not on the old static export where
 * `images.unoptimized: true` meant shipping 300-400 KB PNGs as-authored.
 *
 * Brand names and logos are NOT translated: they are proper nouns, and the
 * whole set renders in every locale even though the three newest were added
 * after the Japanese and Korean pages were last touched.
 */
export function IntegrationGrid({
  id,
  title,
  integrateTitle,
  integrateCta,
  integrateHref,
  integrations,
  lang,
}: {
  /** Anchor target for the hero's call to action. */
  id?: string
  title: string
  integrateTitle: string
  integrateCta: string
  integrateHref: string
  integrations: readonly Integration[]
  /** Set when this copy is English inside a non-English document. */
  lang?: string
}) {
  return (
    <section id={id} className="container mx-auto px-5 py-20">
      <H2 className="text-balance text-center" lang={lang}>
        {title}
      </H2>

      <ul className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <li key={integration.id}>
            <Card className="h-full overflow-hidden p-0">
              {/*
                Portrait, not 16:9. Every partner screenshot is a tall capture
                of the order form (ratios 0.47-0.65), so a video-shaped frame
                letterboxes them down to a strip and the UI being demonstrated
                becomes unreadable.
              */}
              <div
                className="flex aspect-[3/4] items-center justify-center p-6"
                style={{ backgroundColor: integration.background }}
              >
                <Image
                  src={integration.screenshot}
                  width={360}
                  height={620}
                  // Empty alt: the screenshot shows the same protocol UI on each
                  // partner's site, and the partner is already named below it.
                  // Describing all seven identically would be noise.
                  alt=""
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="h-full w-full object-contain"
                />
              </div>

              <CardContent className="flex items-center justify-between gap-4 p-6">
                <Image
                  src={integration.logo}
                  alt={integration.name}
                  width={120}
                  height={28}
                  className="h-7 w-auto object-contain"
                />

                <div className="flex gap-4 text-xs uppercase tracking-widest">
                  <a
                    href={integration.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    lang="en"
                    className="text-fg transition-colors hover:text-accent-primary"
                  >
                    Demo
                    <span className="sr-only"> — {integration.name}</span>
                  </a>
                  <a
                    href={integration.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    lang="en"
                    className="text-fg transition-colors hover:text-accent-primary"
                  >
                    Code
                    <span className="sr-only"> — {integration.name}</span>
                  </a>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>

      <div className="mt-16 text-center" lang={lang}>
        <H3 weight="medium">{integrateTitle}</H3>
        <Button asChild size="lg" className="mt-6">
          <a href={integrateHref} target="_blank" rel="noopener noreferrer">
            {integrateCta}
          </a>
        </Button>
      </div>
    </section>
  )
}
