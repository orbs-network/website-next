import Image from 'next/image'
import { H2 } from '@/app/components/typography'

/**
 * A full-width diagram, optionally under a heading.
 *
 * Distinct from `ArchitectureSection`, which pairs a diagram with prose and a
 * row of links. The dSLTP page has two sections that are a picture and nothing
 * else — one titled ("Recent and Ongoing Integrations"), one not — and
 * expressing those through `ArchitectureSection` would mean making its body and
 * links optional too, leaving a component whose every prop is optional and
 * whose shape no longer says anything.
 *
 * The title is optional because the legacy content genuinely omits it on one of
 * the two: `section-2/index.md` carries an empty `title:` field.
 */
export function DiagramSection({
  title,
  image,
  imageAlt,
  width,
  height,
  lang,
  titleLang,
}: {
  title?: string
  image: string
  /**
   * The asset's INTRINSIC dimensions.
   *
   * Required rather than assumed. A fixed `aspect-[16/9]` container was the
   * first attempt, and both dSLTP diagrams are 2666x978 — about 2.73:1 — so
   * `object-contain` fitted them into roughly 329px of a 504px box and left
   * ~175px of dead space above and below. Sizing from the real ratio means the
   * section is as tall as its picture, whatever the picture is.
   */
  width: number
  height: number
  /**
   * Required, and required to be meaningful.
   *
   * These sections are ONLY an image — unlike `ArchitectureSection`, there is
   * no prose beside them restating the content, so an empty alt here would
   * leave nothing at all for a screen reader. That is the case where a diagram
   * stops being decorative.
   */
  imageAlt: string
  /** Set when this copy is English inside a non-English document. */
  lang?: string
  /**
   * Set when the HEADING's language differs from the rest of the section.
   *
   * Several legacy section labels stay English in the Korean catalog — "Tool",
   * "Chains", "Orbs Agentic Architecture" — while the copy under them is
   * translated. One section-level `lang` cannot describe both.
   */
  titleLang?: string
}) {
  return (
    <section className="container mx-auto px-5 py-20" lang={lang}>
      {title && (
        <H2 className="mb-12 text-balance text-center" lang={titleLang}>
          {title}
        </H2>
      )}

      <Image
        src={image}
        alt={imageAlt}
        width={width}
        height={height}
        sizes="(min-width: 1024px) 896px, 100vw"
        className="mx-auto h-auto w-full max-w-4xl"
      />
    </section>
  )
}
