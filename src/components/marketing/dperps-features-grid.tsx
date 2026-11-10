import Image from 'next/image'
import { DPERPS_FEATURE_ICONS, type DperpsFeatureId } from '@/content/pages/dperps'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

export type DperpsFeature = { id: DperpsFeatureId; title: string; body: string }

/** Six services, all visible: these descriptions have no hidden interaction. */
export function DperpsFeaturesGrid({ features, locale }: { features: readonly DperpsFeature[]; locale: Locale }) {
  return (
    <ul className="grid gap-x-16 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-[72px] lg:gap-y-0">
      {features.map((feature) => {
        return (
          <li key={feature.id} className="lg:min-h-64 lg:p-6">
            <Image src={DPERPS_FEATURE_ICONS[feature.id]} width={34} height={34} alt="" className="size-[34px]" />
            <h3
              className="mt-6 text-h4 font-normal lg:mt-[22px] lg:text-[24.625px] lg:leading-[30px]"
              lang={textLang(feature.title, locale)}
            >
              {feature.title}
            </h3>
            <p
              className="mt-4 max-w-xs text-p text-fg-muted lg:mt-[22px] lg:max-w-[304px] lg:text-lg lg:leading-[22px]"
              lang={textLang(feature.body, locale)}
            >
              {feature.body}
            </p>
          </li>
        )
      })}
    </ul>
  )
}
