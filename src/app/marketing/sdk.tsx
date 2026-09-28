import { getTranslations } from 'next-intl/server'
import { ClosingCta } from '@/components/marketing/closing-cta'
import { GraphicSplit } from '@/components/marketing/graphic-split'
import { CtaButton } from '@/components/marketing/section-parts'
import { SplitHero } from '@/components/marketing/split-hero'
import { SplitStatement } from '@/components/marketing/split-statement'
import { StatementBand } from '@/components/marketing/statement-band'
import { SDK_GRAPHICS, SDK_LINKS, SDK_MARQUEE } from '@/content/pages/sdk'
import { localeHref } from '@/i18n/availability'
import type { Locale } from '@/i18n/locales'

/**
 * The SDK / API page (#156), from the 3.4 `Desktop / Products / SDK` frame.
 *
 * English only. The copy is new with 3.4 and exists in no other language, so
 * the path is absent from `AVAILABILITY` and no locale route is generated.
 */
export async function SdkPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'pages.sdk' })

  const docs = (label: string) => ({ label, href: SDK_LINKS.docs })

  return (
    <>
      <SplitHero
        eyebrow={t('hero.eyebrow')}
        headline={t('hero.headline')}
        intro={t('hero.intro')}
        cta={docs(t('hero.cta'))}
        graphic={SDK_GRAPHICS.hero}
        locale={locale}
      />

      <SplitStatement
        eyebrow={t('infrastructure.eyebrow')}
        heading={t('infrastructure.heading')}
        body={t('infrastructure.body')}
        locale={locale}
      />

      <StatementBand text={t('band')} locale={locale} />

      <GraphicSplit
        eyebrow={t('integration.eyebrow')}
        heading={t('integration.heading')}
        body={t('integration.body')}
        cta={docs(t('integration.cta'))}
        graphic={SDK_GRAPHICS.integration}
        locale={locale}
      />

      <ClosingCta
        phrases={SDK_MARQUEE.map((id) => t(`marquee.${id}`))}
        pauseLabel={t('marquee.pause')}
        resumeLabel={t('marquee.resume')}
        locale={locale}
        actions={
          <>
            <CtaButton link={docs(t('closing.docs'))} locale={locale} />
            <CtaButton
              link={{ label: t('closing.contact'), href: localeHref(SDK_LINKS.contact, locale) }}
              locale={locale}
            />
          </>
        }
      />
    </>
  )
}
