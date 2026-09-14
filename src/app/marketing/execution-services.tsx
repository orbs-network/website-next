import { getTranslations } from 'next-intl/server'
import { ArchitectureSection } from '@/components/marketing/architecture-section'
import { ProductHero } from '@/components/marketing/product-hero'
import { EXECUTION_SERVICES_DIAGRAMS, EXECUTION_SERVICES_PRODUCTS } from '@/content/pages/execution-services'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

/**
 * Execution Services — Orbs Lambda and Orbs VM.
 *
 * Five sections, all `ArchitectureSection` shapes: two products with their
 * marks, two diagrams with prose. The legacy layout alternates which side the
 * image sits on; `ArchitectureSection` does not offer that and it is not worth
 * a prop, since the distinction carries no meaning beyond rhythm.
 *
 * Japanese is `content/jp/execution-services` with ZERO non-Latin characters —
 * the English text copied — so it falls back per string and is `placeholder`.
 * Korean is a real translation.
 */
export async function ExecutionServicesPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'pages.executionServices' })
  const lang = (key: string) => textLang(t(key), locale)

  return (
    <>
      <ProductHero
        headline={t('hero.headline')}
        intro={t('lambdaProduct.body').split('\n\n')[0]}
        headlineLang={lang('hero.headline') ?? locale}
        lang={lang('lambdaProduct.body')}
      />

      {EXECUTION_SERVICES_PRODUCTS.map((product) => (
        <ArchitectureSection
          key={product.id}
          title={t(`${product.id}.title`)}
          body={t(`${product.id}.body`)}
          image={product.image}
          imageAlt=""
          imageWidth={96}
          imageHeight={96}
          titleLang={lang(`${product.id}.title`)}
          lang={lang(`${product.id}.body`)}
        />
      ))}

      {EXECUTION_SERVICES_DIAGRAMS.map((diagram) => (
        <ArchitectureSection
          key={diagram.id}
          title={t(`${diagram.id}.title`)}
          body={t(`${diagram.id}.body`)}
          image={diagram.src}
          imageAlt={t(`${diagram.id}.title`)}
          imageWidth={diagram.width}
          imageHeight={diagram.height}
          titleLang={lang(`${diagram.id}.title`)}
          lang={lang(`${diagram.id}.body`)}
        />
      ))}
    </>
  )
}
