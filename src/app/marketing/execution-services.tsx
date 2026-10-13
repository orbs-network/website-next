import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { H1, H2 } from '@/app/components/typography'
import { DividedSection } from '@/components/marketing/divided-section'
import { Prose } from '@/components/marketing/prose'
import { Eyebrow } from '@/components/marketing/section-parts'
import { EXECUTION_SERVICES_DIAGRAMS, EXECUTION_SERVICES_PRODUCTS } from '@/content/pages/execution-services'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'
import { cn } from '@/lib/utils'
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
 *  - The alternatives diagram has white labels and needs a dark panel. The
 *    final evolution graph has dark labels and needs white. Each asset keeps
 *    its backing in both themes.
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
              className="mx-auto h-auto w-full max-w-[320px] dark:hidden lg:order-last"
            />
            <Image
              src={product.darkImage}
              alt=""
              width={320}
              height={320}
              sizes="(min-width: 1024px) 320px, 60vw"
              className="mx-auto hidden h-auto w-full max-w-[320px] dark:block lg:order-last"
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
          {/* Each transparent diagram uses the backing its lettering needs. */}
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
