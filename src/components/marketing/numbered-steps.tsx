import { H2 } from '@/app/components/typography'
import { Prose } from './prose'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

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
export type Step = {
  title?: string
  body: string
}

export function NumberedSteps({
  title,
  statement,
  steps,
  locale,
}: {
  title: string
  statement?: string
  /**
   * Steps may be a bare sentence or a titled one. Orbs Agentic's verification
   * flow is four plain sentences; the AI skill's "How It Works" gives each step
   * a name ("Define Intent", "Sign & Submit") that is worth keeping distinct
   * from its explanation.
   */
  steps: readonly Step[]
  /** The document's locale. Each string's own `lang` is derived from it. */
  locale: Locale
}) {
  return (
    <section className="container mx-auto px-5 py-20">
      <div className="mx-auto max-w-3xl">
        <H2 className="text-balance text-center" lang={textLang(title, locale)}>
          {title}
        </H2>

        {statement && (
          <blockquote className="mt-8 border-l-2 border-accent-primary pl-6">
            <Prose text={statement} locale={locale} className="[&_p]:text-lg" />
          </blockquote>
        )}

        <ol className="mt-12 space-y-6">
          {steps.map((step, index) => (
            <li key={step.body} className="flex gap-4">
              <span
                aria-hidden
                className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full border border-border text-detail font-medium"
              >
                {index + 1}
              </span>
              <span className="leading-relaxed">
                {/*
                  A step's name and its explanation are separate strings and
                  are translated separately — the AI skill page keeps names
                  like "Sign & Submit" in English beside a translated body.
                */}
                {step.title && (
                  <span className="font-medium text-fg" lang={textLang(step.title, locale)}>
                    {step.title}.{' '}
                  </span>
                )}
                <span className="text-muted-foreground" lang={textLang(step.body, locale)}>
                  {step.body}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
