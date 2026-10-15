import { ArrowLeftRight, ChartNoAxesCombined, CircleAlert, PanelsTopLeft, Shield, WalletCards } from 'lucide-react'
import type { DperpsFeatureId } from '@/content/pages/dperps'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

const ICONS = {
  pricing: ChartNoAxesCombined,
  execution: ArrowLeftRight,
  positions: PanelsTopLeft,
  hedging: Shield,
  liquidation: CircleAlert,
  settlement: WalletCards,
} satisfies Record<DperpsFeatureId, typeof Shield>

export type DperpsFeature = { id: DperpsFeatureId; title: string; body: string }

/** Six services, all visible: these descriptions have no hidden interaction. */
export function DperpsFeaturesGrid({ features, locale }: { features: readonly DperpsFeature[]; locale: Locale }) {
  return (
    <ul className="grid gap-x-16 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-20">
      {features.map((feature) => {
        const Icon = ICONS[feature.id]
        return (
          <li key={feature.id}>
            <span
              aria-hidden="true"
              className="inline-flex size-8 items-center justify-center rounded-[6px] border border-indigo-400 text-indigo-400"
            >
              <Icon className="size-5" strokeWidth={1.25} />
            </span>
            <h3 className="mt-6 text-h4 font-normal" lang={textLang(feature.title, locale)}>
              {feature.title}
            </h3>
            <p className="mt-4 max-w-xs text-p text-fg-muted" lang={textLang(feature.body, locale)}>
              {feature.body}
            </p>
          </li>
        )
      })}
    </ul>
  )
}
