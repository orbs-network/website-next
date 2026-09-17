import { describe, expect, it } from 'vitest'
import en from '@/i18n/messages/en.json'
import ja from '@/i18n/messages/ja.json'
import ko from '@/i18n/messages/ko.json'
import { CONTRACT_ROLES, ORBS_CONTRACTS, explorerUrl, shortAddress } from './smart-contracts'

/**
 * The legacy page wrote each explorer link by hand, inside the prose, once per
 * locale. 13 of its 15 English links are missing the `/address/` segment and
 * 302 to Etherscan's 404 page, and the Japanese copy of the subscription plan
 * entry dropped its link entirely.
 *
 * Neither is a type error and neither throws — a wrong URL renders exactly like
 * a right one. The port stores each address once as data and generates the URL,
 * which is what makes both unrepeatable; these are the assertions that keep it
 * that way.
 */

/**
 * The shape this page reads out of a catalog.
 *
 * Declared rather than inferred, and the reason is the single `unknown` cast
 * below. A JSON import is typed from its literal contents, so `en`, `ja` and
 * `ko` have three structurally different types — `ja.json` carries a `_note`
 * key the others do not — and none of them is assignable to the others. Writing
 * the shape once says what the page actually depends on, and the assertions
 * below are then the thing that proves the JSON matches it.
 */
type SmartContractsCopy = {
  contracts?: Record<string, Record<string, string>>
  roles?: Record<string, Record<string, string>>
}

/** The one cast, at the JSON boundary, named so it is obvious where it is. */
function copyFor(catalog: { pages: { smartContracts: unknown } }): SmartContractsCopy {
  return catalog.pages.smartContracts as SmartContractsCopy
}

const CATALOGS = { en, ja, ko }

/** A checksummed-or-not Ethereum address: `0x` and exactly 40 hex digits. */
const ADDRESS = /^0x[a-fA-F0-9]{40}$/

describe('the contract list', () => {
  it('holds only well-formed Ethereum addresses', () => {
    const malformed = ORBS_CONTRACTS.flatMap(({ id, addresses }) =>
      addresses.filter((address) => !ADDRESS.test(address)).map((address) => `${id}: ${address}`)
    )

    expect(malformed).toEqual([])
  })

  it('gives every contract at least one address', () => {
    // The Japanese legacy copy had an entry with no link at all, so the reader
    // had no way to reach the contract. Storing addresses once prevents that
    // per-locale; this prevents it outright.
    const linkless = ORBS_CONTRACTS.filter(({ addresses }) => addresses.length === 0).map(({ id }) => id)

    expect(linkless).toEqual([])
  })

  it('builds explorer URLs in the /address/ form', () => {
    // THE regression guard. `https://etherscan.io/0x...` — the legacy form —
    // does not 404 outright, it 302s to an error page, so a browser check
    // looks like it worked until you read the destination.
    for (const { addresses } of ORBS_CONTRACTS) {
      for (const address of addresses) {
        expect(explorerUrl(address)).toBe(`https://etherscan.io/address/${address}`)
      }
    }
  })

  it('shortens an address without losing either end', () => {
    const address = '0xD859701C81119aB12A1e62AF6270aD2AE05c7AB3'

    expect(shortAddress(address)).toBe('0xD859…7AB3')
    // Both ends are what a reader compares against an explorer page. A
    // truncation that kept only the prefix would make every Orbs contract look
    // identical at a glance.
    expect(address.startsWith(shortAddress(address).split('…')[0])).toBe(true)
    expect(address.endsWith(shortAddress(address).split('…')[1])).toBe(true)
  })

  it('has no duplicate ids', () => {
    const ids = ORBS_CONTRACTS.map(({ id }) => id)

    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('the catalogs', () => {
  /**
   * Every id the page renders must resolve in every locale it is reachable in.
   *
   * `/smart-contracts` is `translated` in all three, so a missing key is not a
   * fallback to English — `getTranslations` throws and the page 500s. That
   * surfaces at build time, but only for the locale that happens to be built
   * first, and only once someone builds.
   */
  for (const [locale, catalog] of Object.entries(CATALOGS)) {
    describe(locale, () => {
      const page = copyFor(catalog)

      it('has a name, summary and extra for every contract', () => {
        const missing = ORBS_CONTRACTS.flatMap(({ id }) =>
          ['name', 'summary', 'extra']
            .filter((field) => !page.contracts?.[id]?.[field])
            .map((field) => `${id}.${field}`)
        )

        expect(missing).toEqual([])
      })

      it('has a name and body for every role', () => {
        const missing = CONTRACT_ROLES.flatMap((id) =>
          ['name', 'body'].filter((field) => !page.roles?.[id]?.[field]).map((field) => `${id}.${field}`)
        )

        expect(missing).toEqual([])
      })

      it('carries no contract entry the page does not render', () => {
        // The inverse direction. A catalog key nothing renders is invisible:
        // translated, reviewed, paid for, and never shown.
        const rendered = new Set(ORBS_CONTRACTS.map(({ id }) => id))
        const orphaned = Object.keys(page.contracts ?? {}).filter((id) => !rendered.has(id))

        expect(orphaned).toEqual([])
      })

      it('holds no raw markdown links, because addresses are data now', () => {
        // If a future edit pastes an explorer link back into the copy, it
        // renders as literal `[label](url)` — `Prose` handles paragraphs and
        // bold only. Caught here rather than by a reader.
        const withLinks = Object.entries(page.contracts ?? {})
          .flatMap(([id, fields]) => Object.entries(fields).map(([field, value]) => [`${id}.${field}`, value] as const))
          .filter(([, value]) => /\[[^\]]+\]\([^)]+\)/.test(value))
          .map(([key]) => key)

        expect(withLinks).toEqual([])
      })

      it('holds no hex addresses in the copy', () => {
        const withAddresses = Object.entries(page.contracts ?? {})
          .flatMap(([id, fields]) => Object.entries(fields).map(([field, value]) => [`${id}.${field}`, value] as const))
          .filter(([, value]) => /0x[a-fA-F0-9]{40}/.test(value))
          .map(([key]) => key)

        expect(withAddresses).toEqual([])
      })
    })
  }

  it('translates the copy rather than copying English across', () => {
    // `AVAILABILITY` marks all three `translated`. If a catalog were filled
    // with the English text the page would still build, still render, and still
    // claim a translation in its hreflang — the failure is entirely silent.
    const summary = (catalog: { pages: { smartContracts: unknown } }) => copyFor(catalog).contracts?.item1?.summary

    // Asserted present before being compared. `.not.toBe()` between two
    // `undefined`s passes, so on a catalog that had lost the key entirely this
    // check would go green while proving nothing.
    for (const [locale, catalog] of Object.entries(CATALOGS)) {
      expect(summary(catalog), `${locale} item1.summary`).toBeTypeOf('string')
    }

    expect(summary(ja)).not.toBe(summary(en))
    expect(summary(ko)).not.toBe(summary(en))
    expect(summary(ja)).toMatch(/[぀-ヿ一-龯]/)
    expect(summary(ko)).toMatch(/[가-힯]/)
  })
})
