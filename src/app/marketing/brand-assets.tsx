import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { H1 } from '@/app/components/typography'
import { BRAND_ASSETS } from '@/content/pages/brand-assets'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

/**
 * The brand-asset downloads.
 *
 * Each card shows the SVG and offers both formats. `download` on the anchors so
 * a click saves the file rather than navigating to it — a browser that can
 * render an SVG or PNG inline will otherwise just display it, which is not what
 * "PNG" next to a logo means.
 */
export async function BrandAssetsPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'pages.brandAssets' })

  return (
    <section className="container mx-auto px-5 pt-16 pb-24">
      <H1 className="mb-12">{t('meta.title')}</H1>

      <ul className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {BRAND_ASSETS.map((asset) => (
          <li key={asset.id} className="flex flex-col rounded-sm border border-border">
            {/*
              The panel follows the artwork, not the theme.
              
              These logos are transparent PNGs and SVGs drawn in one colour, so a
              single background cannot show all of them: the white variants
              disappear on light and the black variants disappear on dark. The
              panel is therefore chosen per asset from its own name. Gradient
              variants read on either and take the dark one.
            */}
            <div
              className={`flex flex-1 items-center justify-center rounded-t-sm p-8 ${
                asset.id.includes('black') ? 'bg-neutral-100' : 'bg-neutral-800'
              }`}
            >
              <Image
                src={asset.preview}
                alt=""
                width={200}
                height={120}
                sizes="200px"
                className="h-auto max-h-24 w-auto max-w-[200px]"
              />
            </div>

            <div className="flex items-center justify-between gap-4 p-4">
              <span className="text-detail text-fg-muted" lang={textLang(t(`items.${asset.id}`), locale)}>
                {t(`items.${asset.id}`)}
              </span>

              <span className="flex shrink-0 gap-3">
                {/*
                  `download` turns these into saves rather than navigations.
                  Without it a browser renders the file inline and the reader has
                  to right-click, which is not what a download link should ask
                  of anyone.
                */}
                <a
                  href={asset.png}
                  download
                  className="text-detail font-medium text-accent-primary underline underline-offset-4 hover:text-accent-primary-hover"
                >
                  PNG
                </a>
                <a
                  href={asset.svg}
                  download
                  className="text-detail font-medium text-accent-primary underline underline-offset-4 hover:text-accent-primary-hover"
                >
                  SVG
                </a>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
