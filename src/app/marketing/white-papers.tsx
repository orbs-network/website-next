import { getTranslations } from 'next-intl/server'
import { WhitePaperList } from '@/components/marketing/white-paper-list'
import { WHITE_PAPER_CATEGORIES } from '@/content/pages/white-papers'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

/**
 * The white-paper index.
 *
 * Japanese is a real translation, but only of the papers the Japanese site
 * carries — 24 of the 23 listed here overlap, and the remainder fall back to
 * the English string in the catalog. So each title and abstract gets its own
 * `lang` via `textLang`, rather than one derived for the page: a Japanese
 * document containing English prose has to say which parts are which, or a
 * screen reader reads the English with Japanese rules.
 */
export async function WhitePapersPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'pages.whitePapers' })

  const groups = WHITE_PAPER_CATEGORIES.map((category) => ({
    key: category.key,
    title: t(`categories.${category.key}`),
    titleLang: textLang(t(`categories.${category.key}`), locale),
    papers: category.papers.map((paper) => {
      const title = t(`items.${paper.slug}.title`)
      const abstract = t(`items.${paper.slug}.abstract`)

      return {
        slug: paper.slug,
        /*
         * NOT locale-prefixed. A paper page is a wrapper around one PDF, and
         * the PDF exists in a single language — there is nothing to translate
         * and no /ko/white-papers/<slug> route to send anyone to. Every locale
         * links at the one canonical page.
         */
        href: `/white-papers/${paper.slug}/`,
        title,
        titleLang: textLang(title, locale),
        abstract,
        abstractLang: textLang(abstract, locale),
        date: paper.date,
        image: paper.image,
      }
    }),
  }))

  return <WhitePaperList title={t('meta.title')} groups={groups} />
}
