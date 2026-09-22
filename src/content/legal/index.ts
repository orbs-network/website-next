import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Locale } from '@/i18n/locales'

/**
 * Long-form legal documents, kept as markdown rather than catalog strings.
 *
 * Everything else on the site puts copy in `src/i18n/messages/*.json`, and that
 * is right for UI copy: short strings, interpolated, translated per-key. These
 * are not that. They are documents — a lawyer hands over a new privacy policy
 * and the old one is replaced wholesale, which is also how the Japanese privacy
 * policy exists (a whole translated document, not per-string overrides).
 *
 * They also use markdown constructs the catalog pipeline has no answer for:
 * `Prose` handles paragraph breaks and bold, while these need headings, bullet
 * lists, numbered lists and links. Rendering happens on the server, so the
 * markdown parser never reaches the browser — which was `Prose`'s objection to
 * pulling one in, and does not apply here.
 *
 * Read at module scope with literal paths. These pages are fully static — no
 * `revalidate` on any marketing route — so this runs at build and the result is
 * baked into the prerendered HTML. `outputFileTracingIncludes` in
 * `next.config.mjs` keeps the files in the deployment regardless, so this does
 * not quietly break if a page ever becomes dynamic.
 */
const DIR = join(process.cwd(), 'src/content/legal')

function read(file: string): string {
  return readFileSync(join(DIR, file), 'utf8')
}

/**
 * How a document should be presented, beyond its text.
 *
 * `lang` and `dir` are per-DOCUMENT rather than per-locale, because the two can
 * disagree — see the accessibility declaration below.
 */
export type LegalDocument = {
  /** Markdown source, by locale. A locale absent here has no translation. */
  body: Partial<Record<Locale, string>>
  /**
   * BCP 47 tag for the document's own language, when it differs from the route
   * it is served at.
   */
  lang?: string
  dir?: 'ltr' | 'rtl'
}

const DOCUMENTS = {
  '/privacy-policy': {
    body: {
      en: read('privacy-policy.en.md'),
      // A real translation, not a placeholder. Korean has none — the legacy
      // `ko/privacy-policy` is the English text copied verbatim, so it is
      // marked `placeholder` in AVAILABILITY and serves English.
      ja: read('privacy-policy.ja.md'),
    },
  },
  '/terms-of-use': {
    body: { en: read('terms-of-use.en.md') },
  },
  /**
   * English route, Hebrew document.
   *
   * The declaration is written in Hebrew because it exists to satisfy Israeli
   * accessibility regulation (תקנות שוויון זכויות, standard ת"י 5568), and it
   * is the same single document on the legacy site at the English URL. So the
   * route is `/accessibility-declaration` with `lang="en"` on the page, while
   * the document itself carries `lang="he"` and `dir="rtl"`.
   *
   * Getting this wrong would leave a screen reader announcing Hebrew with
   * English pronunciation rules on the page whose entire subject is
   * accessibility. The Latin runs inside it — browser and screen-reader names
   * like Firefox, NVDA, VoiceOver — are handled by the bidi algorithm once
   * `dir` is set correctly, which is exactly what it is for.
   */
  '/accessibility-declaration': {
    body: { en: read('accessibility-declaration.en.md') },
    lang: 'he',
    dir: 'rtl',
  },
  '/liquidity-hub-terms-of-use': {
    body: { en: read('liquidity-hub-terms-of-use.en.md') },
  },
  /*
    Three documents carried over from the legacy site, which #38 found live with
    no route here — they would have 404ed at cutover.

    English only, and that is a finding rather than a shortcut. Legacy has a
    `ko/dtwap-dlimit-disclaimer` and a `jp/ORBS-NFT-CONTEST-OFFICIAL-RULES`, but
    both hold the ENGLISH text: 2 and 43 non-Latin characters respectively,
    against 281 and 1,504 words. Shipping those as separate files would be two
    copies of English pretending to be translations, so those locales are
    `placeholder` in the availability map instead and `LegalPage` serves the
    English body with `lang="en"` on it.

    The URLs keep their legacy spelling, including the shouted one. They are
    what is indexed, and a prettier path plus a redirect is more moving parts
    than the ugliness is worth.
  */
  '/dtwap-dlimit-disclaimer': {
    body: { en: read('dtwap-dlimit-disclaimer.en.md') },
  },
  '/orbs-ecosystem-grant-program-terms-and-conditions': {
    body: { en: read('orbs-ecosystem-grant-program-terms-and-conditions.en.md') },
  },
  '/ORBS-NFT-CONTEST-OFFICIAL-RULES': {
    body: { en: read('orbs-nft-contest-official-rules.en.md') },
  },
} as const satisfies Record<string, LegalDocument>

export type LegalPagePath = keyof typeof DOCUMENTS

/**
 * Re-exported with a widened value type.
 *
 * `as const satisfies` above is what infers `LegalPagePath` from the keys, but
 * it also narrows each entry's `body` to exactly the locales it happens to
 * define — so indexing one by a `Locale` variable is an error on every entry
 * that lacks that locale, which is the normal case. Annotating here keeps the
 * literal key union and gives callers one uniform value type.
 */
export const LEGAL_DOCUMENTS: Record<LegalPagePath, LegalDocument> = DOCUMENTS
