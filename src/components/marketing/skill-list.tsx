import Link from 'next/link'
import { H2, H3 } from '@/app/components/typography'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Prose } from './prose'

export type SkillEntry = {
  /** Message key and React key. */
  id: string
  /** Skill name. Not translated — it names a package. */
  name: string
  /** The skill's own page on this site. */
  href: string
  /** Chains it supports, and the order types it offers. Proper nouns. */
  chains: readonly string[]
  orderTypes: readonly string[]
}

export type ResolvedSkill = SkillEntry & {
  description: string
}

/**
 * The AI skills index: one card per skill.
 *
 * Deliberately not `FeatureGrid`. A skill card is a catalogue ENTRY — it
 * carries structured metadata (which chains, which order types) alongside its
 * description, and those are lists rather than prose. Flattening them into a
 * paragraph would lose the thing a reader is scanning for.
 *
 * There is one skill today. This still renders as a list rather than a single
 * bespoke block, because the legacy page is an index and the next skill should
 * need no layout work.
 */
export function SkillList({
  title,
  intro,
  chainsLabel,
  orderTypesLabel,
  skills,
  lang,
}: {
  title: string
  intro?: string
  chainsLabel: string
  orderTypesLabel: string
  skills: readonly ResolvedSkill[]
  /** Set when this copy is English inside a non-English document. */
  lang?: string
}) {
  return (
    <section className="container mx-auto px-5 py-20" lang={lang}>
      <div className="mx-auto max-w-3xl text-center">
        <H2 className="text-balance">{title}</H2>
        {intro && <Prose text={intro} className="mt-6 [&_p]:text-lg" />}
      </div>

      <ul className="mx-auto mt-16 grid max-w-4xl gap-8">
        {skills.map((skill) => (
          <li key={skill.id}>
            {/* `relative` bounds the stretched link that makes the card clickable. */}
            <Card className="relative h-full transition-colors hover:border-accent-primary">
              <CardHeader>
                <H3 weight="medium">
                  <Link
                    href={skill.href}
                    lang="en"
                    className="after:absolute after:inset-0 transition-colors hover:text-accent-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {skill.name}
                  </Link>
                </H3>
              </CardHeader>

              <CardContent>
                <Prose text={skill.description} />

                <dl className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-detail font-semibold uppercase tracking-wide text-fg-muted">{chainsLabel}</dt>
                    <dd className="mt-1 text-detail text-muted-foreground" lang="en">
                      {skill.chains.join(', ')}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-detail font-semibold uppercase tracking-wide text-fg-muted">
                      {orderTypesLabel}
                    </dt>
                    <dd className="mt-1 text-detail text-muted-foreground" lang="en">
                      {skill.orderTypes.join(', ')}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  )
}
