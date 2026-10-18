import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { H1 } from '@/app/components/typography'
import { Button } from '@/components/ui/button'
import { HeroFacetField } from '@/components/marketing/hero-facet-field'
import { LogoRow } from '@/components/marketing/logo-row'
import { SectionBackdrop } from '@/components/marketing/section-backdrop'
import { HOME_VENUES } from '@/content/pages/home'
import { localeHref } from '@/i18n/availability'
import { textLang } from '@/i18n/script'
import type { Locale } from '@/i18n/locales'

/** The approved legacy landing copy, rather than the English refresh under a locale URL. */
export async function LocalizedHomePage({ locale }: { locale: Exclude<Locale, 'en'> }) {
  const t = await getTranslations({ locale, namespace: 'pages.localizedHome' })

  return (
    <>
      <section className="relative isolate overflow-hidden py-section">
        <HeroFacetField>
          <SectionBackdrop variant="dots" />
        </HeroFacetField>
        <div className="container relative z-10 flex min-h-[28rem] flex-col items-center justify-center py-16 text-center">
          <H1 className="max-w-4xl whitespace-pre-line text-balance" lang={textLang(t('headline'), locale)}>
            {t('headline')}
          </H1>
          <p className="mt-8 max-w-2xl text-p text-fg-muted" lang={textLang(t('intro'), locale)}>
            {t('intro')}
          </p>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Button asChild>
              <Link href={localeHref('/overview', locale)} lang={textLang(t('overview'), locale)}>
                {t('overview')}
              </Link>
            </Button>
            {locale === 'ko' && (
              <Button variant="secondary" asChild>
                <a href="mailto:hello@orbs.com" lang={textLang(t('contact'), locale)}>
                  {t('contact')}
                </a>
              </Button>
            )}
          </div>
        </div>
      </section>
      {locale === 'ko' && <LogoRow title={t('partners')} items={HOME_VENUES} locale={locale} marquee />}
    </>
  )
}
