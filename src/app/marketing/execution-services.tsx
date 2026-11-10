import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { H1, H2 } from '@/app/components/typography'
import { DividedSection } from '@/components/marketing/divided-section'
import { Prose } from '@/components/marketing/prose'
import { NETWORK_DOCS_URL } from '@/content/shared/sdk'
import { Eyebrow, ThemedGraphic } from '@/components/marketing/section-parts'
import { SplitHero } from '@/components/marketing/split-hero'
import { HERO_GRAPHICS } from '@/content/shared/hero-graphics'
import { EXECUTION_SERVICES_DIAGRAMS, EXECUTION_SERVICES_PRODUCTS } from '@/content/pages/execution-services'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'
import { cn } from '@/lib/utils'
import { InnerClosingCta } from './inner-closing'

/** November Templates handoff: hero, Lambda, VM and the shared closing CTA. */
export async function ExecutionServicesPage({ locale }: { locale: Locale }) {
  if (locale === 'ja') return JapaneseExecutionServicesPage()

  const t = await getTranslations({ locale, namespace: 'pages.executionServices' })
  const lang = (key: string) => textLang(t(key), locale)

  return (
    <>
      <SplitHero
        eyebrow={t('eyebrows.hero')}
        headline={t('hero.headline')}
        intro={t('hero.intro')}
        cta={{ label: t('hero.cta'), href: NETWORK_DOCS_URL }}
        graphic={HERO_GRAPHICS.executionServices}
        locale={locale}
        className="lg:min-h-[620px] lg:py-16"
        graphicClassName="lg:max-w-[450px]"
      />
      {EXECUTION_SERVICES_PRODUCTS.map((product) => (
        <section key={product.id} className="container border-t border-border pt-6 pb-20">
          <Eyebrow text={t(`eyebrows.${product.id}`)} locale={locale} />
          <div className="mt-10 grid items-center gap-12 lg:min-h-[360px] lg:grid-cols-[minmax(0,650fr)_minmax(0,560fr)] lg:gap-24">
            <div>
              <H2 className="text-balance" lang={lang(`${product.id}.title`)}>
                {t(`${product.id}.title`)}
              </H2>
              <p className="mt-6 text-p font-medium text-fg" lang={lang(`${product.id}.tagline`)}>
                {t(`${product.id}.tagline`)}
              </p>
              <Prose text={t(`${product.id}.body`)} locale={locale} className="mt-7 [&_p]:text-p [&_p]:text-fg" />
            </div>
            {/* Concept illustrations, not interactive consoles. */}
            <div className="mx-auto w-full max-w-[560px]">
              <ThemedGraphic
                graphic={product.illustration}
                sizes="(min-width: 1024px) 40vw, 90vw"
                className="h-auto w-full"
              />
            </div>
          </div>
        </section>
      ))}
      <InnerClosingCta locale={locale} />
    </>
  )
}

/** Keep the published Japanese archive composition and its original assets. */
async function JapaneseExecutionServicesPage() {
  const locale = 'ja' as const
  const t = await getTranslations({ locale, namespace: 'pages.executionServices' })
  const lang = (key: string) => textLang(t(key), locale)

  return (
    <>
      <section className="container pt-16 pb-section lg:pt-24">
        <Eyebrow text={t('eyebrows.hero')} locale={locale} />
        <H1 className="mt-3 max-w-5xl text-balance" lang={lang('hero.headline')}>
          {t('hero.headline')}
        </H1>
      </section>
      {EXECUTION_SERVICES_PRODUCTS.map((product) => (
        <DividedSection key={product.id} eyebrow={t(`eyebrows.${product.id}`)} locale={locale}>
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-32">
            <div lang={lang(`${product.id}.body`)}>
              <H2 className="text-balance" lang={lang(`${product.id}.title`)}>
                {t(`${product.id}.title`)}
              </H2>
              <Prose text={t(`${product.id}.body`)} className="mt-10 [&_p]:text-p [&_p]:text-fg" />
            </div>
            <div className="lg:order-last">
              <Image
                src={product.image}
                alt=""
                width={320}
                height={320}
                sizes="(min-width: 1024px) 320px, 60vw"
                className="mx-auto h-auto w-full max-w-[320px] dark:hidden"
              />
              <Image
                src={product.darkImage}
                alt=""
                width={320}
                height={320}
                sizes="(min-width: 1024px) 320px, 60vw"
                className="mx-auto hidden h-auto w-full max-w-[320px] dark:block"
              />
            </div>
          </div>
        </DividedSection>
      ))}
      {EXECUTION_SERVICES_DIAGRAMS.map((diagram) => (
        <DividedSection
          key={diagram.id}
          eyebrow={t(`eyebrows.${diagram.id}`)}
          heading={t(`${diagram.id}.title`)}
          intro={t(`${diagram.id}.body`)}
          locale={locale}
        >
          <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-32">
            <div className={cn('p-6 lg:col-start-2', diagram.background)}>
              <Image
                src={diagram.src}
                alt={t(`${diagram.id}.title`)}
                lang={lang(`${diagram.id}.title`)}
                width={diagram.width}
                height={diagram.height}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="h-auto w-full"
              />
            </div>
          </div>
        </DividedSection>
      ))}
      <InnerClosingCta locale={locale} />
    </>
  )
}
