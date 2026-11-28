import type { Locale } from '@/i18n/locales'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * FAQ documents, stored as markdown for the reasons set out in
 * `src/content/legal/index.ts`.
 *
 * The legacy site kept each answer in its own file — 45 of them across two
 * pages, each with frontmatter naming the question — plus an index file per
 * section listing the order. That is a lot of moving parts for what is, on the
 * page, one document. Here `##` is a section and `###` a question, so the order
 * and grouping are simply the order they are written in.
 */
const DIR = join(process.cwd(), 'src/content/faq')

function read(file: string): string {
  return readFileSync(join(DIR, file), 'utf8')
}

export type FaqDocumentEntry = {
  body: Partial<Record<Locale, string>>
}

const DOCUMENTS = {
  '/faq': {
    body: { en: read('faq.en.md'), ja: read('faq.ja.md'), ko: read('faq.ko.md') },
  },
  '/dtwap-and-dlimit-faq': {
    body: { en: read('dtwap-and-dlimit-faq.en.md'), ja: read('dtwap-and-dlimit-faq.ja.md'), ko: read('dtwap-and-dlimit-faq.ko.md') },
  },
} as const satisfies Record<string, FaqDocumentEntry>

export type FaqPagePath = keyof typeof DOCUMENTS

/** Widened for the same reason as `LEGAL_DOCUMENTS` — see that file. */
export const FAQ_DOCUMENTS: Record<FaqPagePath, FaqDocumentEntry> = DOCUMENTS
