import Image from 'next/image'
import { DPERPS_FEATURE_ICONS, type DperpsFeatureId } from '@/content/pages/dperps'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

export type DperpsFeature = { id: DperpsFeatureId; title: string; body: string }

/** Six services, all visible: these descriptions have no hidden interaction. */
export function DperpsFeaturesGrid({ features, locale }: { features: readonly DperpsFeature[]; locale: Locale }) {
  return (
    <ul className="grid gap-x-16 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-20">
      {features.map((feature) => {
        return (
          <li key={feature.id}>
            <Image src={DPERPS_FEATURE_ICONS[feature.id]} width={34} height={34} alt="" className="size-[34px]" />
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
