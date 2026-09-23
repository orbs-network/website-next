import { Separator } from '@/components/ui/separator'
import type { Locale } from '@/i18n/locales'
import { Prose } from './prose'

/**
 * Legal fine print at the foot of a page.
 *
 * Perpetual Hub carries a beta/risk disclaimer that the legacy page sets apart
 * with a `<div class='line-separator'>` and italics. It is deliberately its own
 * component rather than more paragraphs in the section above: the copy is a
 * legal notice, not marketing prose, and it must not inherit the emphasis or
 * the reading weight of the pitch it follows.
 *
 * Rendered smaller and italic, matching the legacy treatment. Not hidden or
 * collapsed — it is a risk disclosure, and burying it would be the one styling
 * choice with consequences beyond taste.
 */
export function Disclaimer({ text, locale }: { text: string; locale: Locale }) {
  return (
    <section className="container mx-auto px-5 pb-20">
      <div className="mx-auto max-w-3xl">
        <Separator className="mb-8" />
        {/*
          `Prose` marks each paragraph. A disclaimer is one catalog string, so
          this is the case where a single section `lang` was least wrong — but
          it is still a guess, and a risk disclosure is the last place to keep
          one.
        */}
        <Prose text={text} locale={locale} className="[&_p]:text-detail [&_p]:italic" />
      </div>
    </section>
  )
}
