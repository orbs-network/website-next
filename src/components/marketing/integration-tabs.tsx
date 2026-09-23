'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { H2 } from '@/app/components/typography'
import { CodeBlock, type CopyLabels } from './code-block'
import { Prose } from './prose'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

export type IntegrationTab = {
  id: string
  label: string
  body: string
  /** The sample shown beside the copy. Omit for a tab that has none. */
  code?: string
}

/**
 * "What integrating actually involves", as a small set of tabs.
 *
 * ON THE CODE PANEL, because the comment that used to be here was wrong and the
 * mistake cost a page section. It read:
 *
 *   "The legacy section rendered a code panel beside the copy, but the panel's
 *    `code` prop was empty in the content — it displayed nothing."
 *
 * The first half is true and the conclusion does not follow. The legacy React
 * partial does pass `code=""`, but the panel is filled in at runtime by vanilla
 * JS outside the React tree — `assets/js/dtwap/index.js` fetches
 * `assets/datasets/dtwap-snippets.json` and renders it with highlight.js. The
 * live page has always shown real code there. Reading the partial and stopping
 * is how three pages shipped without it; see #167.
 *
 * `code` is optional because not every caller has a sample, and a tab with none
 * shows its copy alone rather than an empty box.
 *
 * A client component because tab selection is interactive; the copy is passed
 * in as props so the translated strings are still resolved on the server.
 */
export function IntegrationTabs({
  title,
  tabs,
  copyLabels,
  locale,
}: {
  title: string
  tabs: readonly IntegrationTab[]
  /**
   * Labels for the copy button. Required once any tab carries `code`, and
   * checked at the call site rather than here — a tab with a sample and no way
   * to copy it is a worse outcome than a type error.
   */
  copyLabels?: CopyLabels
  /** The document's locale. Each string's own `lang` is derived from it. */
  locale: Locale
}) {
  if (tabs.length === 0) {
    return null
  }

  return (
    <section className="container mx-auto px-5 py-20">
      <H2 className="text-balance text-center" lang={textLang(title, locale)}>
        {title}
      </H2>

      <Tabs defaultValue={tabs[0].id} className="mx-auto mt-12 max-w-3xl">
        <TabsList className="mx-auto">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} lang={textLang(tab.label, locale)}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-8">
            <Prose text={tab.body} locale={locale} className="[&_p]:text-lg" />
            {/*
              One `CodeBlock` per tab rather than one shared block fed the
              selected tab's code. Each gets its own copy state, so switching
              tabs cannot leave "Copied" sitting over a sample nobody copied —
              and the copy is `lang`-neutral source either way.
            */}
            {tab.code !== undefined && copyLabels !== undefined && (
              <CodeBlock code={tab.code} labels={copyLabels} className="mt-8" />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </section>
  )
}
