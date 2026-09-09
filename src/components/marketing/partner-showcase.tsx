import Image from 'next/image'
import { H2, H3 } from '@/app/components/typography'
import { Button } from '@/components/ui/button'

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
 */
export function PartnerShowcase({
  title,
  partners,
  lang,
  titleLang,
}: {
  title: string
  partners: readonly ResolvedPartner[]
  /** Set when this copy is English inside a non-English document. */
  lang?: string
  /**
   * Set when the HEADING's language differs from the rest of the section.
   *
   * "Partners" stays English in the Korean catalog — the legacy page leaves it
   * that way — while the subtitles, lists and calls to action beneath it are
   * Korean. Deriving one section language from the title marked all of that
   * Korean copy English, the same defect `ArchitectureSection` carries a
   * `titleLang` to avoid.
   */
  titleLang?: string
}) {
  return (
    <section className="container mx-auto px-5 py-20" lang={lang}>
      <H2 className="text-balance text-center" lang={titleLang}>
        {title}
      </H2>

      <div className="mt-16 space-y-16">
        {partners.map((partner) => (
          <div key={partner.id} className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <Image src={partner.logo} alt={partner.name} width={160} height={40} className="h-10 w-auto" />

              <H3 weight="medium" className="mt-6">
                {partner.subtitle}
              </H3>

              <ul className="mt-6 space-y-3 text-muted-foreground">
                {partner.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <Button asChild variant="secondary" className="mt-8">
                <a href={partner.href} target="_blank" rel="noopener noreferrer">
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
    </section>
  )
}
