import { Button } from '@/components/ui/button'
import { H2 } from '@/app/components/typography'
import Image from 'next/image'
import Link from 'next/link'
import { Prose } from './prose'

export type ArchitectureLink = {
  /** Falsy label means the link is not shown — see the dTWAP page for why. */
  label: string
  href: string
}

/**
 * Either both or neither — an image with no `alt` is an unlabelled image, and
 * an `alt` with no image is a caller that thinks it set one. Same shape as
 * `ProductHero`, for the same reason.
 */
type SectionImage =
  | {
      image: string
      imageAlt: string
      /**
       * The asset's INTRINSIC dimensions.
       *
       * Required alongside the image, for the reason `DiagramSection` documents:
       * a fixed `aspect-[16/9]` frame left visible dead space around every
       * diagram that was not 16:9, and none of them are.
       */
      imageWidth: number
      imageHeight: number
    }
  | { image?: undefined; imageAlt?: undefined; imageWidth?: undefined; imageHeight?: undefined }

/**
 * How the protocol works: prose and the deeper reading, optionally with a
 * diagram above them.
 *
 * Links with an empty label are skipped rather than rendered blank. The legacy
 * Japanese and Korean pages omit the FAQ link entirely — the key exists in
 * their catalogs with an empty value, so parity is expressed as data rather
 * than as a conditional in the page.
 *
 * The image is optional because dSLTP's closing "Powered by Orbs Network"
 * block is this shape without one: a heading, prose and a row of links. Adding
 * a decorative diagram there to satisfy a required prop would be inventing
 * content.
 */
export function ArchitectureSection({
  title,
  body,
  image,
  imageAlt,
  imageWidth,
  imageHeight,
  links,
  lang,
  titleLang,
  eyebrow,
}: SectionImage & {
  /**
   * Optional: Liquidity Hub's closing paragraph and diagram continue the
   * section above them rather than starting a new one.
   */
  title?: string
  body: string
  /**
   * Optional: two of Perpetual Hub's sections are a heading, prose and a
   * diagram with nothing to click. Requiring an empty array there would be a
   * caller working around the type rather than describing the section.
   */
  links?: readonly ArchitectureLink[]
  /** Set when this copy is English inside a non-English document. */
  lang?: string
  /**
   * Set when the HEADING's language differs from the rest of the section.
   *
   * A section-level `lang` alone assumes every string in it shares a language,
   * and dSLTP's closing block is the case that breaks: "Powered by Orbs
   * Network" is English in the Korean catalog too — the legacy page leaves it
   * that way — while the prose and button labels beneath it are Korean.
   * Deriving one value from the title marked the Korean copy English.
   */
  titleLang?: string
  /**
   * A short bracketed label above the heading — "[PROOF OF WORK]".
   *
   * Rendered as a `<p>` rather than a heading: it labels the section for the
   * eye but is not a level in the document outline, and making it one would
   * put "[PRODUCTS]" between the page `h1` and the real `h2`.
   */
  eyebrow?: string
}) {
  const visibleLinks = (links ?? []).filter((link) => link.label.trim() !== '')

  return (
    <section className="container mx-auto px-5 py-20" lang={lang}>
      {eyebrow && (
        <p className="mb-4 text-center text-detail font-medium uppercase tracking-widest text-fg-muted">
          {eyebrow}
        </p>
      )}

      {title && (
        <H2 className="text-balance text-center" lang={titleLang}>
          {title}
        </H2>
      )}

      {image && (
        <Image
          src={image}
          alt={imageAlt}
          width={imageWidth}
          height={imageHeight}
          sizes="(min-width: 1024px) 896px, 100vw"
          className="mx-auto mt-12 h-auto w-full max-w-4xl"
        />
      )}

      <Prose text={body} className="mx-auto mt-12 max-w-3xl" />

      {visibleLinks.length > 0 && (
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          {visibleLinks.map((link) => (
            <Button key={link.href} asChild variant="secondary">
              {link.href.startsWith('/') ? (
                <Link href={link.href}>{link.label}</Link>
              ) : (
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.label}
                </a>
              )}
            </Button>
          ))}
        </div>
      )}
    </section>
  )
}
