import { withSocialMetadata } from '@/app/lib/social-metadata'
import { H1 } from '@/app/components/typography'
import { MarkdownProse, plainText } from '@/components/marketing/markdown-prose'
import { Button } from '@/components/ui/button'
import { WHITE_PAPERS } from '@/content/pages/white-papers'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { localeAlternates, localeHref, placeholderRobots } from '@/i18n/availability'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

export async function whitePaperMetadata(slug: string, locale: Locale): Promise<Metadata> {
  const paper = WHITE_PAPERS.find((entry) => entry.slug === slug)

  const t = await getTranslations({ locale, namespace: 'pages.whitePapers' })

  if (!paper) return { title: t('ui.notFound') }

  const title = t(`items.${slug}.title`)

  return withSocialMetadata(
    {
      title,
      // Stripped: a meta description is text, and several abstracts contain
      // markdown links that would otherwise be published as raw syntax.
      description: plainText(t(`items.${slug}.abstract`)).trim() || `${title} — ${t('meta.description')}`,
      alternates: localeAlternates(`/white-papers/${slug}`, locale),
      robots: placeholderRobots(`/white-papers/${slug}`, locale),
    },
    { locale }
  )
}

export async function WhitePaperPage({ slug, locale }: { slug: string; locale: Locale }) {
  const paper = WHITE_PAPERS.find((entry) => entry.slug === slug)

  // `dynamicParams` defaults to true, so a slug outside generateStaticParams
  // still reaches this. Without the check it would render a page with no PDF.
  if (!paper) notFound()

  const t = await getTranslations({ locale, namespace: 'pages.whitePapers' })

  return (
    <section className="container pt-16 pb-24">
      <div className="mx-auto max-w-4xl">
        <nav aria-label={t('ui.breadcrumb')} className="mb-8">
          <Link
            href={localeHref('/white-papers', locale)}
            className="text-detail uppercase tracking-widest text-fg-muted transition-colors hover:text-accent-primary"
          >
            ← {t('meta.title')}
          </Link>
        </nav>

        <H1 lang={textLang(t(`items.${slug}.title`), locale)}>{t(`items.${slug}.title`)}</H1>

        {paper.date && (
          <p lang="en" className="mt-3 text-detail uppercase tracking-widest text-fg-muted">
            {paper.date}
          </p>
        )}

        {/* Through the markdown renderer: several abstracts contain links. */}
        <div className="mt-6 max-w-2xl" lang={textLang(t(`items.${slug}.abstract`), locale)}>
          <MarkdownProse>{t(`items.${slug}.abstract`)}</MarkdownProse>
        </div>

        <div className="mt-8">
          {/*
            A real link, not an embedded viewer as the primary control.
            Browsers disagree about rendering PDFs inline — iOS Safari in
            particular hands them to a system viewer — and a reader who wants
            the document wants the file. The preview below is an enhancement.
          */}
          <Button asChild>
            <a href={paper.pdf} target="_blank" rel="noopener noreferrer" lang={locale}>
              {t('ui.readPdf')}
            </a>
          </Button>
        </div>

        {/*
          Other editions of the same paper.

          Five papers have a Japanese or Korean PDF. The legacy site reached
          them through /jp/ and /ko/ paper routes; these links preserve
          the additional published language editions rather than losing
          five published documents. Each anchor carries the `lang` of the
          edition it points at, not of this page.
        */}
        {paper.pdfByLocale && (
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            {paper.pdfByLocale.ja && (
              <li>
                <a
                  href={paper.pdfByLocale.ja}
                  target="_blank"
                  rel="noopener noreferrer"
                  lang="ja"
                  className="text-accent-primary underline underline-offset-4 hover:text-accent-primary-hover"
                >
                  {t('ui.japaneseEdition')}
                </a>
              </li>
            )}
            {paper.pdfByLocale.ko && (
              <li>
                <a
                  href={paper.pdfByLocale.ko}
                  target="_blank"
                  rel="noopener noreferrer"
                  lang="ko"
                  className="text-accent-primary underline underline-offset-4 hover:text-accent-primary-hover"
                >
                  {t('ui.koreanEdition')}
                </a>
              </li>
            )}
          </ul>
        )}

        {/*
          `hidden` below `sm`. An inline PDF on a phone is a postage stamp the
          reader cannot zoom independently of the page, and every mobile browser
          already offers a better full-screen viewer via the link above.
        */}
        <object
          data={paper.pdf}
          type="application/pdf"
          className="mt-12 hidden h-[80vh] w-full rounded-sm border border-border sm:block"
          aria-label={t(`items.${slug}.title`)}
        >
          {/* Shown when the browser cannot display a PDF inline. */}
          <p lang={locale} className="p-6 text-fg-muted">
            {t('ui.pdfUnavailable')}{' '}
            <a
              href={paper.pdf}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-primary underline underline-offset-4"
            >
              {t('ui.download')}
            </a>
            .
          </p>
        </object>
      </div>
    </section>
  )
}
