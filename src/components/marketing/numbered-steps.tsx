import { H2 } from '@/app/components/typography'
import { Prose } from './prose'

/**
 * A sequence, numbered because the order is the content.
 *
 * Orbs Agentic's verification flow is four steps that only make sense in order:
 * the agent decides, submits, the oracle prices and checks, then cosigns. An
 * `<ol>` is not decoration here — it is the difference between a list of facts
 * and a description of a process, and it is what a screen reader announces.
 *
 * `statement` is the pull-quote the legacy page sets above the steps. It is a
 * claim about the whole flow rather than a step in it, so it sits outside the
 * list.
 */
export function NumberedSteps({
  title,
  statement,
  steps,
  lang,
}: {
  title: string
  statement?: string
  steps: readonly string[]
  /** Set when this copy is English inside a non-English document. */
  lang?: string
}) {
  return (
    <section className="container mx-auto px-5 py-20" lang={lang}>
      <div className="mx-auto max-w-3xl">
        <H2 className="text-balance text-center">{title}</H2>

        {statement && (
          <blockquote className="mt-8 border-l-2 border-accent-primary pl-6">
            <Prose text={statement} className="[&_p]:text-lg" />
          </blockquote>
        )}

        <ol className="mt-12 space-y-6">
          {steps.map((step, index) => (
            <li key={step} className="flex gap-4">
              <span
                aria-hidden
                className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full border border-border text-detail font-medium"
              >
                {index + 1}
              </span>
              <span className="text-muted-foreground leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
