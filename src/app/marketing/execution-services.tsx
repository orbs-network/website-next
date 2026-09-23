import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { H2 } from '@/app/components/typography'
import { Prose } from '@/components/marketing/prose'
import { ProductHero } from '@/components/marketing/product-hero'
import { EXECUTION_SERVICES_DIAGRAMS, EXECUTION_SERVICES_PRODUCTS } from '@/content/pages/execution-services'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

/**
 * Execution Services — Orbs Lambda and Orbs VM.
 *
 * Laid out here rather than through `ArchitectureSection`, which does not fit
 * this page in two ways that both showed up as real defects:
 *
 *  - It renders every image at `w-full max-w-4xl`. The product marks are
 *    hero-scale illustrations, not icons, so at 896px wide they made the page
 *    6,570px tall for five sections.
 *  - It renders on the page background. Both diagrams have WHITE labels on
 *    transparency — "Simple", "Centralized", "AWS Lambda" — which are close to
 *    invisible on light. They need a dark panel to be legible at all, and that
 *    is a property of these two images rather than of the component.
 *
 * Adding three props to a shared component for one page would be the worse
 * trade. This is the page's own layout.
 */
export async function ExecutionServicesPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'pages.executionServices' })
  const lang = (key: string) => textLang(t(key), locale)

  return (
    <>
      {/*
        The hero carries no intro. Its first version reused the Lambda lead
        paragraph, which the product section below then rendered again in full —
        the same sentence twice in succession, in every locale. The legacy page
        has a bare title here too.
      */}
      <ProductHero headline={t('hero.headline')} intro="" locale={locale} />

      {EXECUTION_SERVICES_PRODUCTS.map((product) => (
        <section key={product.id} className="container mx-auto px-5 py-20" lang={lang(`${product.id}.body`)}>
          <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-[1fr_2fr]">
            {/*
              Capped at 320px. These are decorative brand illustrations, so
              `alt=""` — the heading beside them names the product.
            */}
            <Image
              src={product.image}
              alt=""
              width={320}
              height={320}
              sizes="(min-width: 1024px) 320px, 60vw"
              className="mx-auto h-auto w-full max-w-[320px]"
            />

            <div>
              <H2 className="text-balance" lang={lang(`${product.id}.title`)}>
                {t(`${product.id}.title`)}
              </H2>
              <Prose text={t(`${product.id}.body`)} className="mt-6" />
            </div>
          </div>
        </section>
      ))}

      {EXECUTION_SERVICES_DIAGRAMS.map((diagram) => (
        <section key={diagram.id} className="container mx-auto px-5 py-20" lang={lang(`${diagram.id}.body`)}>
          <div className="mx-auto max-w-4xl">
            <H2 className="text-balance text-center" lang={lang(`${diagram.id}.title`)}>
              {t(`${diagram.id}.title`)}
            </H2>

            {/*
              Dark panel, in both themes. The labels inside these PNGs are white
              on transparency, so on the light background they simply do not
              read. `bg-neutral-900` rather than a token because it is not
              theming — it is the background the artwork was drawn for.
            */}
            <div className="mt-12 rounded-sm bg-neutral-900 p-6">
              <Image
                src={diagram.src}
                alt={t(`${diagram.id}.title`)}
                width={diagram.width}
                height={diagram.height}
                sizes="(min-width: 1024px) 848px, 100vw"
                className="h-auto w-full"
              />
            </div>

            <Prose text={t(`${diagram.id}.body`)} className="mt-12" />
          </div>
        </section>
      ))}
    </>
  )
}
