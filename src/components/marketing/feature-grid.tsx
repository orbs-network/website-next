import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { H2, H3 } from '@/app/components/typography'
import { Prose } from './prose'

export type Feature = {
  id: string
  title: string
  body: string
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
  title: string
  intro?: string
  features: readonly Feature[]
  /** Set when this copy is English inside a non-English document. */
  lang?: string
}) {
  return (
    <section className="container mx-auto px-5 py-20" lang={lang}>
      <div className="mx-auto max-w-3xl text-center">
        <H2 className="text-balance">{title}</H2>
        {intro && <Prose text={intro} className="mt-6 [&_p]:text-lg" />}
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-2">
        {features.map((feature) => (
          <Card key={feature.id} className="h-full">
            <CardHeader>
              <H3 weight="medium">{feature.title}</H3>
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
