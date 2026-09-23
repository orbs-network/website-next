import { Button } from '@/components/ui/button'
import { H2 } from '@/app/components/typography'
import Image from 'next/image'
import Link from 'next/link'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'
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
 *
 * Language is derived per string from `locale`, so a mixed-language section
 * cannot be mislabelled. It used to arrive as a section-level `lang` the caller
 * computed once, plus a `titleLang` escape hatch for the heading — and that
 * still assumed the rest of the section shared one language. dSLTP's closing
 * block is the case that broke it: "Powered by Orbs Network" is English in the
 * Korean catalog too, because the legacy page leaves it that way, while the
 * prose and button labels beneath it are Korean. Every string here now asks
 * `textLang` about itself, so there is no shared value left to get wrong.
 */
export function ArchitectureSection({
  title,
  body,
  image,
  imageAlt,
  imageWidth,
  imageHeight,
  links,
  locale,
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
  /** The document's locale. Each string's own `lang` is derived from it. */
  locale: Locale
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
    <section className="container mx-auto px-5 py-20">
      {eyebrow && (
        <p
          className="mb-4 text-center text-detail font-medium uppercase tracking-widest text-fg-muted"
          lang={textLang(eyebrow, locale)}
        >
          {eyebrow}
        </p>
      )}

      {title && (
        <H2 className="text-balance text-center" lang={textLang(title, locale)}>
          {title}
        </H2>
      )}

      {image && (
        /*
          `alt` is the string being labelled here, not the image. An empty alt
          is a decorative image with no text at all, and `textLang` returns
          `undefined` for it rather than claiming a language.
        */
        <Image
          src={image}
          alt={imageAlt}
          lang={textLang(imageAlt, locale)}
          width={imageWidth}
          height={imageHeight}
          sizes="(min-width: 1024px) 896px, 100vw"
          className="mx-auto mt-12 h-auto w-full max-w-4xl"
        />
      )}

      <Prose text={body} locale={locale} className="mx-auto mt-12 max-w-3xl" />

      {visibleLinks.length > 0 && (
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          {visibleLinks.map((link) => (
            <Button key={link.href} asChild variant="secondary">
              {/*
                Per link, not per row. A label is an accessible name and takes
                its language from the element carrying it — and this row is
                exactly where that bites: the Korean dSLTP page keeps "Orbs
                Docs" in English next to a translated one.
              */}
              {link.href.startsWith('/') ? (
                <Link href={link.href} lang={textLang(link.label, locale)}>
                  {link.label}
                </Link>
              ) : (
                <a href={link.href} lang={textLang(link.label, locale)} target="_blank" rel="noopener noreferrer">
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
