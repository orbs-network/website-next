import { getTranslations } from 'next-intl/server'
import { ClosingCta, ClosingSocialButtons } from '@/components/marketing/closing-cta'
import { CtaButton } from '@/components/marketing/section-parts'
import { HOME_LINKS, HOME_MARQUEE } from '@/content/pages/home'
import type { Locale } from '@/i18n/locales'

/**
 * The shared closing block for inner pages migrated onto the master (#227).
 *
 * The master ends every inner page on the marquee and calls to action, but the
 * legacy pages have no closing copy of their own. Rather than invent per-page
 * phrases, they close on the home page's: the site-wide tagline and the same
 * Follow / Community / Talk to the team row, so the block reads identically
 * wherever a reader meets it. A page that later gets its own marquee copy
 * renders `ClosingCta` directly, as dSPOT and Venues do.
 */
export async function InnerClosingCta({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'pages.home' })

  return (
    <ClosingCta
      phrases={HOME_MARQUEE.map((id) => t(`marquee.${id}`))}
      locale={locale}
      actions={
        <>
          <ClosingSocialButtons
            follow={t('connect.follow')}
            community={t('connect.community')}
            x={HOME_LINKS.x}
            telegram={HOME_LINKS.telegram}
            locale={locale}
          />
          <CtaButton link={{ label: t('connect.contact'), href: HOME_LINKS.contact }} locale={locale} />
        </>
      }
    />
  )
}
