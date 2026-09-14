import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { H1 } from '@/app/components/typography'
import { Button } from '@/components/ui/button'
import { WHITE_PAPERS } from '@/content/pages/white-papers'
import { absoluteUrl } from '@/app/lib/site'

/**
 * One paper: its abstract and the PDF.
 *
 * English-only, deliberately. The page is a wrapper around a single document
 * that exists in one language, so there is nothing to translate — the index
 * links every locale here rather than at a `/ko/white-papers/<slug>` that would
 * show the same English PDF under a Korean tag.
 */

type Props = { params: Promise<{ paper: string }> }

export function generateStaticParams() {
  return WHITE_PAPERS.map(({ slug }) => ({ paper: slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { paper: slug } = await params
  const paper = WHITE_PAPERS.find((entry) => entry.slug === slug)

  if (!paper) return { title: 'Paper not found' }

  const t = await getTranslations({ locale: 'en', namespace: 'pages.whitePapers' })

  return {
    title: t(`items.${slug}.title`),
    description: t(`items.${slug}.abstract`),
    alternates: { canonical: absoluteUrl(`/white-papers/${slug}/`) },
  }
}

export default async function WhitePaperPage({ params }: Props) {
  const { paper: slug } = await params
  const paper = WHITE_PAPERS.find((entry) => entry.slug === slug)

  // `dynamicParams` defaults to true, so a slug outside generateStaticParams
  // still reaches this. Without the check it would render a page with no PDF.
  if (!paper) notFound()

  const t = await getTranslations({ locale: 'en', namespace: 'pages.whitePapers' })

  return (
    <section className="container mx-auto px-5 pt-16 pb-24">
      <div className="mx-auto max-w-4xl">
        <nav aria-label="Breadcrumb" className="mb-8">
          <Link
            href="/white-papers/"
            className="text-detail uppercase tracking-widest text-fg-muted transition-colors hover:text-accent-primary"
          >
            ← {t('meta.title')}
          </Link>
        </nav>

        <H1>{t(`items.${slug}.title`)}</H1>

        {paper.date && <p className="mt-3 text-detail uppercase tracking-widest text-fg-muted">{paper.date}</p>}

        <p className="mt-6 max-w-2xl leading-relaxed text-fg-muted">{t(`items.${slug}.abstract`)}</p>

        <div className="mt-8">
          {/*
            A real link, not an embedded viewer as the primary control.
            Browsers disagree about rendering PDFs inline — iOS Safari in
            particular hands them to a system viewer — and a reader who wants
            the document wants the file. The preview below is an enhancement.
          */}
          <Button asChild size="lg">
            <a href={paper.pdf} target="_blank" rel="noopener noreferrer">
              Read the paper (PDF)
            </a>
          </Button>
        </div>

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
          <p className="p-6 text-fg-muted">
            Your browser cannot display this PDF.{' '}
            <a
              href={paper.pdf}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-primary underline underline-offset-4"
            >
              Download it instead
            </a>
            .
          </p>
        </object>
      </div>
    </section>
  )
}
