import { Database, Files, Fingerprint, LayoutGrid, Scan, ShieldCheck, Sparkles, SquarePen } from 'lucide-react'
import type { HomeFeatureId } from '@/content/pages/home'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

const ICONS = {
  nonCustodial: Scan,
  gasless: Sparkles,
  mev: ShieldCheck,
  permissionless: LayoutGrid,
  robust: Database,
  whiteLabel: Fingerprint,
  reporting: Files,
  audited: SquarePen,
} satisfies Record<HomeFeatureId, typeof Scan>

export type HomeBenefit = { id: HomeFeatureId; title: string; body: string }

/** All eight summaries stay visible; these are descriptions, not controls. */
export function HomeBenefitsGrid({ features, locale }: { features: readonly HomeBenefit[]; locale: Locale }) {
  return (
    <ul className="grid sm:grid-cols-2 lg:grid-cols-4 [&>li]:border-t [&>li]:border-[#c6c3de] sm:[&>li:nth-child(odd)]:border-r lg:[&>li]:border-r lg:[&>li:nth-child(4n)]:border-r-0">
      {features.map((feature) => {
        const Icon = ICONS[feature.id]
        return (
          <li key={feature.id} className="px-6 py-8 lg:px-8">
            <span
              aria-hidden="true"
              className="inline-flex size-8 items-center justify-center rounded-[6px] border border-indigo-400 text-indigo-400"
            >
              <Icon className="size-5" strokeWidth={1.25} />
            </span>
            <h3
              className="mt-6 max-w-[16rem] text-[1.5rem] font-normal leading-tight text-fg"
              lang={textLang(feature.title, locale)}
            >
              {feature.title}
            </h3>
            <p className="mt-4 text-p text-fg-muted" lang={textLang(feature.body, locale)}>
              {feature.body}
            </p>
          </li>
        )
      })}
    </ul>
  )
}
