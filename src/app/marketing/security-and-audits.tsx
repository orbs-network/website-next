import { getTranslations } from 'next-intl/server'
import { H1 } from '@/app/components/typography'
import { InnerSection } from '@/components/marketing/inner-section'
import { Eyebrow } from '@/components/marketing/section-parts'
import { EARLIER_SPOT_AUDITS, SECURITY_SOURCES, SPOT_AUDITS } from '@/content/pages/security-and-audits'
import type { Locale } from '@/i18n/locales'

export async function SecurityAndAuditsPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'pages.securityAndAudits' })
  const links = (items: readonly { id: string; href: string }[], namespace: string) => (
    <ul className="space-y-6 text-p">
      {items.map(({ id, href }) => (
        <li key={id}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 [overflow-wrap:anywhere] hover:text-accent-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {t(`${namespace}.${id}`)}
          </a>
        </li>
      ))}
    </ul>
  )
  return (
    <>
      <section className="container pt-16 pb-section lg:pt-24">
        <Eyebrow text={t('hero.eyebrow')} locale={locale} />
        <H1 className="mt-3 max-w-5xl text-balance">{t('hero.headline')}</H1>
        <p className="mt-10 max-w-3xl text-p text-fg">{t('hero.intro')}</p>
        <p className="mt-6 max-w-3xl text-p text-fg-muted">{t('scope')}</p>
        <nav className="mt-12" aria-label={t('browse')}>
          <ul className="flex flex-wrap gap-x-8 gap-y-4 text-detail font-medium uppercase tracking-wide">
            {(['spotAudits', 'earlierAudits', 'sources'] as const).map((id) => (
              <li key={id}>
                <a href={`#${id}`} className="underline underline-offset-4">
                  {t(`${id}.title`)}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </section>
      {(['orders', 'network'] as const).map((id) => (
        <InnerSection key={id} eyebrow={t(`${id}.eyebrow`)} heading={t(`${id}.title`)} locale={locale}>
          <p className="text-p text-fg-muted">{t(`${id}.body`)}</p>
        </InnerSection>
      ))}
      <InnerSection
        id="spotAudits"
        eyebrow={t('spotAudits.eyebrow')}
        heading={t('spotAudits.title')}
        intro={t('spotAudits.body')}
        locale={locale}
      >
        {links(SPOT_AUDITS, 'spotAudits.reports')}
      </InnerSection>
      <InnerSection
        id="earlierAudits"
        eyebrow={t('earlierAudits.eyebrow')}
        heading={t('earlierAudits.title')}
        locale={locale}
      >
        {links(EARLIER_SPOT_AUDITS, 'earlierAudits.reports')}
      </InnerSection>
      <InnerSection id="sources" eyebrow={t('sources.eyebrow')} heading={t('sources.title')} locale={locale}>
        {links(SECURITY_SOURCES, 'sources.links')}
      </InnerSection>
    </>
  )
}
