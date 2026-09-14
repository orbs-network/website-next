import { H1, H2 } from '@/app/components/typography'
import { Disclosure } from './disclosure'
import { MarkdownProse } from './markdown-prose'

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
  lang,
}: {
  markdown: string
  title: string
  /**
   * Set when the questions and answers are in a different language from the
   * route — i.e. when an untranslated locale falls back to English.
   *
   * The title is excluded from it: that comes from the message catalog and IS
   * in the route's language, so it stays outside the tagged container. Same
   * split as the legal pages.
   */
  lang?: string
}) {
  const sections = parseFaq(markdown)

  return (
    <section className="container mx-auto px-5 pt-16 pb-24">
      <div className="mx-auto max-w-3xl">
        <H1 className="mb-12">{title}</H1>

        <div lang={lang}>
          {sections.map((section) => (
            <div key={section.title} className="mt-12 first:mt-0">
              <H2 className="mb-6">{section.title}</H2>

              <div className="divide-y divide-border border-y border-border">
                {section.questions.map(({ question, answer }) => (
                  <Disclosure key={question} summary={question}>
                    <MarkdownProse>{answer}</MarkdownProse>
                  </Disclosure>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
