import Image from 'next/image'
import { H3 } from '@/app/components/typography'
import { Button } from '@/components/ui/button'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

export type Partner = {
  /** Message key and React key. */
  id: string
  /** Brand name. Not translated — a proper noun. */
  name: string
  logo: string
  screenshot: { src: string; width: number; height: number }
  href: string
}

export type ResolvedPartner = Partner & {
  subtitle: string
  items: readonly string[]
  cta: string
}

/**
 * Launch partners: for each, the brand, what you get trading there, and a way in.
 *
 * Distinct from `IntegrationGrid`, which shows a wall of DEXs that have adopted
 * a protocol. This is a much smaller, more deliberate block — two partners,
 * each with its own pitch, list and call to action — and the legacy page treats
 * it that way too.
 *
 * The screenshot is decorative: it shows the partner's swap UI, which the list
 * beside it already describes, and the link is named separately. Its brand LOGO
 * is not decorative — it is the only thing naming which partner this is, so it
 * carries the partner's name as alt text.
 *
 * No `<section>` or heading of its own since the page moved onto the master
 * (#227): Liquidity Hub, its only caller, wraps it in a `DividedSection`, which
 * carries the rule, eyebrow and "Partners" heading.
 */
export function PartnerShowcase({
  partners,
  locale,
}: {
  partners: readonly ResolvedPartner[]
  /**
   * The document's locale. Each string's own `lang` is derived from it.
   *
   * The subtitles, lists and calls to action are Korean in the Korean
   * catalog; each takes its own `lang` rather than sharing one guess.
   */
  locale: Locale
}) {
  return (
    <div className="space-y-16">
      {partners.map((partner) => (
        <div key={partner.id} className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            {/*
                This logo's alt IS the partner's name — unlike the screenshot
                below it, which is decorative. A proper noun, so it stays Latin
                and gets marked inside a non-Latin document.
              */}
            <Image
              src={partner.logo}
              alt={partner.name}
              lang={textLang(partner.name, locale)}
              width={160}
              height={40}
              className="h-10 w-auto"
            />

            <H3 weight="medium" className="mt-6" lang={textLang(partner.subtitle, locale)}>
              {partner.subtitle}
            </H3>

            <ul className="mt-6 space-y-3 text-muted-foreground">
              {partner.items.map((item) => (
                <li key={item} lang={textLang(item, locale)}>
                  {item}
                </li>
              ))}
            </ul>

            <Button asChild variant="secondary" className="mt-8">
              <a href={partner.href} lang={textLang(partner.cta, locale)} target="_blank" rel="noopener noreferrer">
                {partner.cta}
              </a>
            </Button>
          </div>

          <Image
            src={partner.screenshot.src}
            alt=""
            width={partner.screenshot.width}
            height={partner.screenshot.height}
            className="h-auto w-full rounded-lg"
          />
        </div>
      ))}
    </div>
  )
}
