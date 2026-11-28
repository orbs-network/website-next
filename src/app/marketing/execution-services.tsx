import { getTranslations } from 'next-intl/server'
import { H2 } from '@/app/components/typography'
import { Prose } from '@/components/marketing/prose'
import { NETWORK_DOCS_URL } from '@/content/shared/sdk'
import { Eyebrow } from '@/components/marketing/section-parts'
import { InlineProductGraphic } from '@/components/marketing/inline-product-graphic'
import { SplitHero } from '@/components/marketing/split-hero'
import { HERO_GRAPHICS } from '@/content/shared/hero-graphics'
import { EXECUTION_SERVICES_PRODUCTS } from '@/content/pages/execution-services'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'
import { InnerClosingCta } from './inner-closing'

/** November Templates handoff: hero, Lambda, VM and the shared closing CTA. */
export async function ExecutionServicesPage({ locale }: { locale: Locale }) {
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
          <div className="mt-10 grid items-center gap-12 lg:min-h-[360px] lg:grid-cols-[minmax(0,650fr)_minmax(0,560fr)] lg:gap-[164px]">
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
              <InlineProductGraphic artwork={product.id === 'lambdaProduct' ? 'lambda' : 'vm'} />
            </div>
          </div>
        </section>
      ))}
      <div className="lg:mt-[150px]">
        <InnerClosingCta locale={locale} />
      </div>
    </>
  )
}
