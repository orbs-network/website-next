'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { H2 } from '@/app/components/typography'
import { Prose } from './prose'

export type IntegrationTab = {
  id: string
  label: string
  body: string
}

/**
 * "What integrating actually involves", as a small set of tabs.
 *
 * The legacy section rendered a code panel beside the copy, but the panel's
 * `code` prop was empty in the content — it displayed nothing. Rather than
 * invent code samples that were never on the site, this shows the copy that did
 * exist. Real samples can be added later from the twap-ui repo without changing
 * the shape here.
 *
 * A client component because tab selection is interactive; the copy is passed
 * in as props so the translated strings are still resolved on the server.
 */
export function IntegrationTabs({
  title,
  tabs,
  lang,
}: {
  title: string
  tabs: readonly IntegrationTab[]
  /** Set when this copy is English inside a non-English document. */
  lang?: string
}) {
  if (tabs.length === 0) {
    return null
  }

  return (
    <section className="container mx-auto px-5 py-20" lang={lang}>
      <H2 className="text-balance text-center">{title}</H2>

      <Tabs defaultValue={tabs[0].id} className="mx-auto mt-12 max-w-3xl">
        <TabsList className="mx-auto">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-8">
            <Prose text={tab.body} className="[&_p]:text-lg" />
          </TabsContent>
        ))}
      </Tabs>
    </section>
  )
}
