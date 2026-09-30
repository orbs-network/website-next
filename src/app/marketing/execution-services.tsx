import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { H1, H2 } from '@/app/components/typography'
import { DividedSection } from '@/components/marketing/divided-section'
import { Prose } from '@/components/marketing/prose'
import { Eyebrow } from '@/components/marketing/section-parts'
import { EXECUTION_SERVICES_DIAGRAMS, EXECUTION_SERVICES_PRODUCTS } from '@/content/pages/execution-services'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'
import { InnerClosingCta } from './inner-closing'

/**
 * Execution Services — Orbs Lambda and Orbs VM.
 *
 * On the inner-page master (#227): ruled sections opening on a bracketed
 * eyebrow, text left, and the shared closing block. The copy is the legacy
 * page's; only the eyebrows are new.
 *
 * Laid out here rather than through `ArchitectureSection` or `GraphicSplit`:
 *
 *  - The product marks are hero-scale illustrations, not icons. At the 896px
 *    `ArchitectureSection` gives an image they made the page 6,570px tall for
 *    five sections, so they are capped at 320px.
 *  - Both diagrams have WHITE labels on transparency — "Simple",
 *    "Centralized", "AWS Lambda" — which are close to invisible on light. They
 *    need a dark panel whatever the theme, which is a property of these two
 *    images rather than of any shared section.
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
        has a bare title here too, and no illustration, so no graphic column.
      */}
      <section className="container pt-16 pb-section lg:pt-24">
        <Eyebrow text={t('eyebrows.hero')} locale={locale} />
        <H1 className="mt-3 max-w-5xl text-balance" lang={lang('hero.headline')}>
          {t('hero.headline')}
        </H1>
      </section>

      {EXECUTION_SERVICES_PRODUCTS.map((product) => (
        <DividedSection key={product.id} eyebrow={t(`eyebrows.${product.id}`)} locale={locale}>
          {/* The master's `06` split: copy left, illustration right. */}
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-32">
            <div lang={lang(`${product.id}.body`)}>
              <H2 className="text-balance" lang={lang(`${product.id}.title`)}>
                {t(`${product.id}.title`)}
              </H2>
              <Prose text={t(`${product.id}.body`)} className="mt-10 [&_p]:text-p [&_p]:text-fg" />
            </div>

            {/* Decorative brand illustrations, so `alt=""`: the heading names the product. */}
            <Image
              src={product.image}
              alt=""
              width={320}
              height={320}
              sizes="(min-width: 1024px) 320px, 60vw"
              className="mx-auto h-auto w-full max-w-[320px] lg:order-last"
            />
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
          {/*
            In the right-hand column, under the body it illustrates. Dark panel
            in both themes: the labels inside these PNGs are white on
            transparency. `bg-neutral-900` rather than a token because it is not
            theming — it is the background the artwork was drawn for.
          */}
          <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-32">
            <div className="bg-neutral-900 p-6 lg:col-start-2">
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
