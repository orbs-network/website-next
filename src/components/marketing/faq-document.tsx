import { H1, H2 } from '@/app/components/typography'
import { Disclosure } from './disclosure'
import { MarkdownProse } from './markdown-prose'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

/**
 * A FAQ page: sections of questions, each answer collapsed until opened.
 *
 * Each answer is a `Disclosure` — see that component for why this is native
 * `<details>` rather than a JS accordion.
 */

export type FaqSection = {
  title: string
  questions: readonly { question: string; answer: string }[]
}

/**
 * Splits the markdown into sections and questions.
 *
 * `##` opens a section, `###` a question, and everything up to the next heading
 * is that question's answer. Answers contain no headings of their own — checked
 * across all 45 in both documents — so the split is unambiguous rather than
 * merely usually right.
 *
 * Done here rather than storing the structure as data because the structure IS
 * the document: a question belongs to the section it is written under, and
 * expressing that as a separate index would be a second thing to keep in step.
 */
export function parseFaq(markdown: string): FaqSection[] {
  const sections: FaqSection[] = []

  for (const block of markdown.split(/^## /m).slice(1)) {
    const [heading, ...rest] = block.split(/^### /m)

    sections.push({
      title: heading.trim(),
      questions: rest.map((entry) => {
        const newline = entry.indexOf('\n')

        return {
          question: entry.slice(0, newline === -1 ? undefined : newline).trim(),
          answer: newline === -1 ? '' : entry.slice(newline).trim(),
        }
      }),
    })
  }

  return sections
}

export function FaqDocument({
  markdown,
  title,
  locale,
}: {
  markdown: string
  title: string
  /**
   * The document's locale. Each string's own `lang` is derived from it.
   *
   * This replaces a `lang` the caller set on a container wrapping every
   * question and answer, for when an untranslated locale falls back to
   * English. It had to exclude the title — that comes from the catalog and IS
   * in the route's language — which is the tell: the moment a wrapper needs an
   * exception carved out of it, it is describing several languages at once.
   *
   * Fallback is also not all-or-nothing. A partially translated FAQ has
   * translated questions with English answers, and the container could not say
   * so. Each string asks for itself now, so a section that gets translated
   * later stops being marked English with no code change.
   */
  locale: Locale
}) {
  const sections = parseFaq(markdown)

  return (
    <section className="container mx-auto px-5 pt-16 pb-24">
      <div className="mx-auto max-w-3xl">
        <H1 className="mb-12" lang={textLang(title, locale)}>
          {title}
        </H1>

        {sections.map((section) => (
          <div key={section.title} className="mt-12 first:mt-0">
            <H2 className="mb-6" lang={textLang(section.title, locale)}>
              {section.title}
            </H2>

            <div className="divide-y divide-border border-y border-border">
              {section.questions.map(({ question, answer }) => (
                /*
                  The question is a string and is marked here; the answer is
                  markdown and marks its own blocks — `MarkdownProse` puts a
                  `lang` on each paragraph, list item and heading, so no
                  wrapper is needed inside the disclosure and its `space-y-4`
                  is left alone.
                */
                <Disclosure key={question} summary={question} locale={locale}>
                  <MarkdownProse locale={locale}>{answer}</MarkdownProse>
                </Disclosure>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
