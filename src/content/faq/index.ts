import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Locale } from '@/i18n/locales'

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
  /** Markdown source, by locale. A locale absent here has no translation. */
  body: Partial<Record<Locale, string>>
}

const DOCUMENTS = {
  /**
   * No `ja` body, deliberately.
   *
   * `content/jp/faq` exists but is the English text — zero Japanese characters
   * across all 33 answers, and the only difference from the English file is one
   * trailing slash. Carrying it as a Japanese body would serve English prose
   * under `lang="ja"`; omitted, Japanese falls back to English and is tagged
   * `en`, while `AVAILABILITY` keeps the route reachable and `noindex`.
   *
   * Korean is a real translation of all 33.
   */
  '/faq': {
    body: { en: read('faq.en.md'), ko: read('faq.ko.md') },
  },
  /** No `content/jp/dtwap-and-dlimit-faq` at all, so Japanese is not offered. */
  '/dtwap-and-dlimit-faq': {
    body: { en: read('dtwap-and-dlimit-faq.en.md'), ko: read('dtwap-and-dlimit-faq.ko.md') },
  },
} as const satisfies Record<string, FaqDocumentEntry>

export type FaqPagePath = keyof typeof DOCUMENTS

/** Widened for the same reason as `LEGAL_DOCUMENTS` — see that file. */
export const FAQ_DOCUMENTS: Record<FaqPagePath, FaqDocumentEntry> = DOCUMENTS
