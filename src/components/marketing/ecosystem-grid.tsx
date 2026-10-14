'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { XIcon } from '@/components/icons'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { EcosystemCard, EcosystemFilter } from '@/content/pages/ecosystem-cards'

export type EcosystemGridLabels = {
  filterLabel: string
  filters: Record<EcosystemFilter, string>
  viewOnX: string
}

/** One logo grid; product membership remains curated data rather than visible copy. */
export function EcosystemGrid({ cards, labels }: { cards: readonly EcosystemCard[]; labels: EcosystemGridLabels }) {
  const filters = Object.entries(labels.filters) as [EcosystemFilter, string][]
  return (
    <Tabs defaultValue="all">
      <TabsList
        aria-label={labels.filterLabel}
        className="flex h-auto flex-wrap gap-2 overflow-visible rounded-none bg-transparent p-0"
      >
        {filters.map(([id, label]) => (
          <TabsTrigger
            key={id}
            value={id}
            className="rounded-none border border-border px-4 py-3 text-detail uppercase tracking-wide data-[state=active]:bg-fg data-[state=active]:text-bg data-[state=active]:shadow-none"
          >
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      {filters.map(([filter]) => (
        <TabsContent key={filter} value={filter} className="mt-10">
          <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
            {cards
              .filter((card) => filter === 'all' || card.categories.includes(filter))
              .map((card) => (
                <li key={card.id}>
                  <a
                    href={card.xUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${card.name}: ${labels.viewOnX}`}
                    className="relative flex h-full min-h-40 flex-col items-center justify-center bg-surface p-5 text-center text-fg transition-transform duration-200 motion-safe:hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none"
                  >
                    <span className="flex h-16 w-full items-center justify-center">
                      <Image
                        src={card.logo.src}
                        width={card.logo.width}
                        height={card.logo.height}
                        alt=""
                        sizes="(min-width: 1024px) 12rem, 40vw"
                        className={cn(
                          'h-14 w-full object-contain',
                          card.logo.onDark && 'dark:hidden',
                          card.logo.invertOnDark && 'dark:brightness-0 dark:invert'
                        )}
                      />
                      {card.logo.onDark && (
                        <Image
                          src={card.logo.onDark}
                          width={card.logo.width}
                          height={card.logo.height}
                          alt=""
                          sizes="(min-width: 1024px) 12rem, 40vw"
                          className="hidden h-14 w-full object-contain dark:block"
                        />
                      )}
                    </span>
                    <span className="mt-4 max-w-full text-detail leading-normal font-medium [overflow-wrap:anywhere]">
                      {card.name}
                    </span>
                    <XIcon className="absolute right-3 bottom-3 size-3" aria-hidden />
                  </a>
                </li>
              ))}
          </ul>
        </TabsContent>
      ))}
    </Tabs>
  )
}
