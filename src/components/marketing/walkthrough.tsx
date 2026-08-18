import { H2 } from '@/app/components/typography'
import Image from 'next/image'

export type WalkthroughStep = {
  id: string
  image: string
  caption: string
}

/**
 * Annotated screenshots showing what the product does.
 *
 * The legacy site put these in a JavaScript slider, which hid two of the three
 * screenshots behind interaction: crawlers index them as hidden content, and a
 * reader has to work to see material that fits on one screen. Three abreast on
 * desktop and stacked on mobile shows everything at once, needs no client
 * JavaScript, and removes a carousel dependency.
 */
export function Walkthrough({
  title,
  steps,
  lang,
}: {
  title: string
  steps: readonly WalkthroughStep[]
  /** Set when this copy is English inside a non-English document. */
  lang?: string
}) {
  return (
    <section className="container mx-auto px-5 py-20">
      <H2 className="text-balance text-center" lang={lang}>
        {title}
      </H2>

      <ol className="mt-16 grid gap-10 md:grid-cols-3">
        {steps.map((step) => (
          <li key={step.id}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted">
              {/*
                Empty alt: the caption immediately below states what the
                screenshot shows, so alt text would repeat it verbatim to a
                screen reader.
              */}
              <Image
                src={step.image}
                alt=""
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover object-top"
              />
            </div>
            <p className="mt-4 text-muted-foreground leading-relaxed">{step.caption}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
