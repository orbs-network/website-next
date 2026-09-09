import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { H2, H3 } from '@/app/components/typography'
import { Prose } from './prose'

export type Feature = {
  id: string
  title: string
  body: string
  /**
   * Optional card illustration.
   *
   * dTWAP and dLIMIT do not set one: their legacy cards borrow
   * `assets/img/ton-vote/tools/*.svg` from an unrelated page, which is filler
   * rather than design. dSLTP's are drawn for it, so they render.
   */
  icon?: string
}

/**
 * A titled section introducing a set of features or benefits as cards.
 *
 * Generic rather than dTWAP-specific: every product page in the legacy site has
 * a section of this exact shape (dLIMIT, dSLTP, Liquidity Hub, Perpetual Hub),
 * so this is the piece the remaining pages reuse.
 */
export function FeatureGrid({
  title,
  intro,
  features,
  lang,
}: {
  /**
   * Optional: Liquidity Hub's two coloured boxes continue the sentence above
   * them rather than opening a section of their own, so there is no heading to
   * write. An empty string would render an empty `h2`.
   */
  title?: string
  intro?: string
  features: readonly Feature[]
  /** Set when this copy is English inside a non-English document. */
  lang?: string
}) {
  return (
    <section className="container mx-auto px-5 py-20" lang={lang}>
      <div className="mx-auto max-w-3xl text-center">
        {title && <H2 className="text-balance">{title}</H2>}
        {intro && <Prose text={intro} className={cn('[&_p]:text-lg', title && 'mt-6')} />}
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-2">
        {features.map((feature) => (
          <Card key={feature.id} className="h-full">
            <CardHeader>
              {feature.icon && (
                // Decorative: the heading beneath states the same thing in
                // words, so an alt would be read twice.
                <Image src={feature.icon} alt="" width={48} height={48} className="mb-4 size-12" />
              )}
              {/*
                `h3` under a section heading, `h2` without one. With no section
                title these cards ARE the top level of their section, and
                rendering them as `h3` straight after the page `h1` skips a
                level — readers navigating by heading hit a gap. `asChild` keeps
                the `h3` styling either way, so only the outline changes.
              */}
              <H3 asChild weight="medium">
                {title ? <h3>{feature.title}</h3> : <h2>{feature.title}</h2>}
              </H3>
            </CardHeader>
            <CardContent>
              <Prose text={feature.body} />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
