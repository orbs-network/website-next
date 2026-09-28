import Image from 'next/image'
import { H2 } from '@/app/components/typography'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'
import { CtaButton, Eyebrow, type SectionLink } from './section-parts'
import type { SectionGraphic } from './split-hero'

/**
 * `06 / Split / Text + Graphic`: eyebrow at the top of the left column, the
 * heading, body and button at its foot, and a graphic filling the right.
 *
 * The text sits at the BOTTOM of its column because that is how the design
 * places it — the eyebrow top-left, a 220px spacer, then the copy aligned with
 * the base of the graphic. `mt-auto` in a stretched grid cell is that, at any
 * height the graphic ends up.
 */
export function GraphicSplit({
  eyebrow,
  heading,
  body,
  cta,
  graphic,
  locale,
}: {
  eyebrow: string
  heading: string
  body: string
  cta: SectionLink
  /** Decorative, like the hero's: the copy beside it carries the meaning. */
  graphic: SectionGraphic
  locale: Locale
}) {
  return (
    <section className="container mx-auto px-5 py-section">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-16">
        <div className="flex flex-col">
          <Eyebrow text={eyebrow} locale={locale} />

          <div className="mt-10 lg:mt-auto lg:pt-24">
            <H2 className="text-balance" lang={textLang(heading, locale)}>
              {heading}
            </H2>
            <p className="mt-10 text-p text-fg" lang={textLang(body, locale)}>
              {body}
            </p>
            <div className="mt-14">
              <CtaButton link={cta} locale={locale} />
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <Image
            src={graphic.src}
            alt=""
            width={graphic.width}
            height={graphic.height}
            sizes="(min-width: 1024px) 60vw, 28rem"
            className="h-auto w-full"
          />
        </div>
      </div>
    </section>
  )
}
