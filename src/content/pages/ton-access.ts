import SNIPPETS from './ton-access-snippets.json'

/**
 * TON Access — the decentralised RPC gateway page.
 *
 * The interesting part is the code example, which is three dropdowns over a
 * snippet library. The legacy page renders all four client libraries whatever
 * HTTP API flavour is selected, so 14 of its 24 combinations produce an EMPTY
 * code block — "Raw ADNL Proxy" with "NPM TonWeb", for instance. Measured
 * against `assets/datasets/gateway-snippets.json`: 10 keys, not 24.
 *
 * That is not a missing-data problem to fill in. Each HTTP API flavour genuinely
 * only works with certain client libraries — ADNL is not HTTP, so the HTTP
 * libraries cannot speak it. So the valid pairs are modelled here and the
 * selector derives its library options from the chosen flavour. An invalid
 * combination stops being something a reader can select rather than something
 * they select and get nothing from.
 *
 * `ton-access.test.ts` asserts the matrix and the snippet file agree in both
 * directions, so neither can drift.
 */

export const TON_ACCESS_NETWORKS = ['mainnet', 'testnet'] as const
export type TonAccessNetwork = (typeof TON_ACCESS_NETWORKS)[number]

export type TonAccessFlavor = {
  id: string
  /** Display name. A product name, so it is not in the message catalogs. */
  label: string
  /** The client libraries that can talk to this flavour, in legacy order. */
  libraries: readonly { id: string; label: string }[]
}

const NPM_TON = { id: 'npm-ton', label: 'NPM ton' }
const NPM_TONWEB = { id: 'npm-tonweb', label: 'NPM TonWeb (JavaScript)' }
const CDN_TONWEB = { id: 'cdn-tonweb', label: 'CDN TonWeb' }
const TON_LITE_CLIENT = { id: 'ton-lite-client', label: 'ton-lite-client' }

export const TON_ACCESS_FLAVORS: readonly TonAccessFlavor[] = [
  {
    id: 'toncenter-http-api-v2',
    label: 'TonCenter HTTP API v2',
    libraries: [NPM_TON, NPM_TONWEB, CDN_TONWEB],
  },
  {
    id: 'tonhub-http-api-v4',
    label: 'TonHub HTTP API v4',
    libraries: [NPM_TON],
  },
  {
    // Not HTTP at all, which is why it pairs with exactly one library.
    id: 'raw-adnl-api',
    label: 'Raw ADNL Proxy',
    libraries: [TON_LITE_CLIENT],
  },
]

/**
 * Keyed `<flavor>.<library>.<network>`, the same shape the legacy dataset used.
 *
 * Kept as JSON rather than a TypeScript object because that is what it is — ten
 * blocks of verbatim example code with no logic in them. A `.ts` file would
 * mean escaping decisions on every future snippet; JSON has none to make.
 * Line endings were normalised from CRLF on import.
 */
export const TON_ACCESS_SNIPPETS: Readonly<Record<string, string>> = SNIPPETS

/** The key for a selection, in the dataset's own format. */
export function snippetKey(flavor: string, library: string, network: string): string {
  return `${flavor}.${library}.${network}`
}

/**
 * The six feature cards, in legacy order.
 *
 * `image` points into `public/marketing/pos/shapes/` rather than a copy under
 * this page's own directory — they are the same six abstract shapes `/pos`
 * already ships, and the legacy site referenced the shared
 * `assets/img/pos-universe/shapes/` for exactly that reason.
 *
 * The legacy cards each carry `button: Read more` with NO destination. Omitted
 * rather than ported: a button that goes nowhere is worse than no button, and
 * this repo has already dropped five ecosystem entries for the same reason.
 */
export const TON_ACCESS_CARDS = [
  { id: 'unthrottled', image: '/marketing/pos/shapes/shape1.svg' },
  { id: 'noApiKey', image: '/marketing/pos/shapes/shape3.svg' },
  { id: 'serverless', image: '/marketing/pos/shapes/shape9.svg' },
  { id: 'decentralized', image: '/marketing/pos/shapes/shape5.svg' },
  { id: 'highRedundancy', image: '/marketing/pos/shapes/shape2.svg' },
  { id: 'wideSupport', image: '/marketing/pos/shapes/shape4.svg' },
] as const

/**
 * The two developer quotes.
 *
 * Photographs are 336x336 originals, square, and rendered at 64px — declared
 * here so `next/image` reserves the box before the file loads. Measured with
 * sharp, not read off the legacy markup.
 */
export const TON_ACCESS_VOICES = [
  {
    id: 'talKol',
    name: 'Tal Kol (@talkol)',
    href: 'https://t.me/talkol',
    image: { src: '/marketing/ton-access/tal-kol.png', width: 336, height: 336 },
  },
  {
    id: 'shaharYakir',
    name: 'Shahar Yakir (@mrbonezy)',
    href: 'https://t.me/mrbonezy',
    image: { src: '/marketing/ton-access/shahar-yakir.png', width: 336, height: 336 },
  },
] as const

export const TON_ACCESS_IMAGES = {
  hero: '/marketing/ton-access/hero.svg',
  /** Measured: 1800x516 after optimisation. */
  schema: { src: '/marketing/ton-access/schema.png', width: 1800, height: 516 },
} as const

export const TON_ACCESS_LINKS = {
  github: 'https://github.com/orbs-network/ton-access',
  telegram: 'https://t.me/OrbsNetwork',
} as const

/** The id the hero's "get started" button scrolls to. */
export const TON_ACCESS_EXAMPLE_ID = 'get-started'
