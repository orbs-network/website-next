import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { H2 } from '@/app/components/typography'
import { Disclosure } from '@/components/marketing/disclosure'
import { MarkdownProse } from '@/components/marketing/markdown-prose'
import { ProductHero } from '@/components/marketing/product-hero'
import { Prose } from '@/components/marketing/prose'
import { CONTRACT_ROLES, ORBS_CONTRACTS, explorerUrl, shortAddress } from '@/content/pages/smart-contracts'
import { localeHref } from '@/i18n/availability'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

/**
 * Steps the section headings down on small screens.
 *
 * `text-h2` is a fixed 56px — the type scale has no responsive step, which is
 * #108. `H2` compensates with `hyphens-auto break-words`, and that is enough
 * for a heading whose longest word fits; it is not enough here. "CONTRACTS
 * MANAGEMENT AND ADMINISTRATIVE ARCHITECTURE" at 56px inside the 350px this
 * container gives at a 390px viewport broke as "ADMINISTR / ATIVE" and
 * "ARCHITECT / URE" — hyphenation cannot save a word wider than its line, and
 * without a hyphenation dictionary it is a bare mid-word break.
 *
 * Applied to BOTH headings rather than only the long one, so the two do not
 * render at different sizes beside each other on a phone. Removable once the
 * scale gains a real step.
 */
const HEADING_STEP = 'text-h3 sm:text-h2'

/**
 * The Orbs PoS contracts deployed on Ethereum.
 *
 * Missed by the Phase 3 sweep because it is not in the legacy nav — it is
 * reachable only from blog posts, which is also why porting it mattered: those
 * posts are in Contentful now, so at cutover the links would have broken.
 *
 * Three sections, all from the existing library: a hero, the contract list as
 * `Disclosure` entries, and the administrative roles. The legacy page wraps the
 * architecture note in its own expandable box; here it is a plain section,
 * because it is the last thing on the page and there is nothing below it to
 * push out of reach.
 *
 * ON THE EXPLORER LINKS. The legacy page writes each one by hand inside the
 * prose, and 13 of the 15 are missing the `/address/` segment — they 302 to
 * Etherscan's 404 page. That is not fixed here by correcting 13 strings; the
 * address is stored as data and the URL is generated from it, so the malformed
 * form has nowhere left to live. See `@/content/pages/smart-contracts`.
 *
 * Only EXPLORER links were lifted out. The copy still carries one ordinary
 * markdown link — the staking contract's specification on GitHub, in all three
 * catalogs — which is why the contract fields render through `MarkdownProse`.
 * An earlier revision stripped every link while extracting the addresses and
 * flattened that one to plain text, turning a working reference into words that
 * cannot be clicked. `smart-contracts.test.ts` now asserts it is still a link.
 *
 * The roles and the architecture note render through `Prose` instead, which is
 * paragraphs and bold only and gives them their spacing. That is safe exactly
 * as long as their copy stays free of markdown, so the test asserts that too
 * rather than leaving it to hold by luck.
 */
export async function SmartContractsPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'pages.smartContracts' })
  const lang = (key: string) => textLang(t(key), locale)

  return (
    <>
      <ProductHero
        headline={t('hero.headline')}
        intro={t('hero.intro')}
        headlineLang={lang('hero.headline') ?? locale}
        lang={lang('hero.intro')}
      />

      <section className="container mx-auto px-5 py-20">
        <div className="mx-auto max-w-3xl divide-y divide-border border-y border-border">
          {ORBS_CONTRACTS.map(({ id, addresses }) => (
            <Disclosure
              key={id}
              summary={t(`contracts.${id}.name`)}
              // Per string, and this page is a good argument for why. The names
              // look like identifiers that would be constant across catalogs,
              // but the Japanese translator rendered most of them as Japanese
              // — コントラクト・レジストリ, 委任 — and left exactly one,
              // `stakingContractHandler`, in English. Measured on the built
              // page: 1 of 15 marked `en`, 14 not.
              //
              // So neither "these are identifiers, mark them all English" nor
              // "this is the Japanese page, mark nothing" is right, and both
              // are the mistake #103 is about. `textLang` inspects the script
              // of each name and is the only thing that gets this correct.
              locale={locale}
            >
              {/*
                Each field carries its OWN language, and `Disclosure` is given
                none. Deriving one from the summary and letting it cover the
                whole panel is the #103 mistake again, and this page has live
                instances of it: in Korean, `item6` and `item15` have Hangul
                summaries and English detail. A single `lang` from the summary
                would have a screen reader pronounce those English paragraphs
                with Korean phonetics.
              */}
              <div lang={lang(`contracts.${id}.summary`)}>
                <MarkdownProse locale={locale}>{t(`contracts.${id}.summary`)}</MarkdownProse>
              </div>
              <div lang={lang(`contracts.${id}.extra`)}>
                <MarkdownProse locale={locale}>{t(`contracts.${id}.extra`)}</MarkdownProse>
              </div>

              <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
                {addresses.map((address) => (
                  <li key={address}>
                    <Link
                      href={explorerUrl(address)}
                      target="_blank"
                      rel="noreferrer"
                      // The visible text is a truncated address, which on its
                      // own tells a screen-reader user nothing about where the
                      // link goes — and "0xD8…7AB3" read character by character
                      // is worse than nothing. The accessible name says what it
                      // is; the visible text stays short enough for a phone.
                      aria-label={`${t('viewOnEtherscan')}: ${address}`}
                      className="font-mono text-detail text-accent-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      {shortAddress(address)}
                    </Link>
                  </li>
                ))}
              </ul>
            </Disclosure>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-5 pb-20">
        <div className="mx-auto max-w-3xl">
          <H2 className={HEADING_STEP} lang={lang('roles.title')}>
            {t('roles.title')}
          </H2>

          <dl className="mt-10 space-y-8">
            {CONTRACT_ROLES.map((id) => (
              <div key={id}>
                {/*
                  A description list, because that is what this is: five names
                  and what each one means. The names are English identifiers in
                  every catalog, hence the `lang` on the term rather than on the
                  list.
                */}
                <dt lang={lang(`roles.${id}.name`)} className="font-mono text-h5 text-fg">
                  {t(`roles.${id}.name`)}
                </dt>
                <dd className="mt-2">
                  <Prose text={t(`roles.${id}.body`)} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="container mx-auto px-5 pb-20">
        <div className="mx-auto max-w-3xl">
          <H2 className={HEADING_STEP} lang={lang('architecture.title')}>
            {t('architecture.title')}
          </H2>
          {/*
            `Prose`, not `MarkdownProse`. All four paragraphs are plain text in
            all three catalogs — no links, lists or bold — and `MarkdownProse`
            emits paragraphs with no margin between them, so on the built page
            the four ran together as one unbroken block. `Prose` spaces them and
            ships no parser for constructs this copy does not use.
          */}
          <div className="mt-6" lang={lang('architecture.body')}>
            <Prose text={t('architecture.body')} />
          </div>

          {/*
            The legacy link here points at `/network`, which returns 404 on the
            live site and has no route in this repo either — it is a promise to
            a page that never existed. `/overview` is the Orbs network overview
            the label actually describes, so the link is repointed rather than
            reproduced or dropped.

            Through `localeHref` so a Japanese reader is not dropped onto the
            English overview: it prefixes the path when that locale's page
            exists, and falls back to the English URL when it does not.
          */}
          <p className="mt-10">
            <Link
              href={localeHref('/overview', locale)}
              lang={lang('backLink')}
              className="text-accent-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {t('backLink')}
            </Link>
          </p>
        </div>
      </section>
    </>
  )
}
