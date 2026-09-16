/**
 * TON.Vote — the no-code DAO governance tool for TON.
 *
 * Two pieces of the legacy content are corrected rather than ported.
 *
 * The SLIDER's three slides carry near-identical captions — slides 2 and 3 are
 * byte-for-byte the same file — and none of them describes what is in its
 * screenshot. Rendered, they show three genuinely different screens: the DAO
 * directory, a proposal with its vote and results, and a project's space page.
 * So each slide gets a caption describing its own screen, which also gives the
 * images alt text that means something instead of the same sentence three
 * times.
 *
 * The PARTNER logos were hotlinked from three third-party hosts —
 * `tonv.s3.us-east-2.amazonaws.com`, `i.ibb.co` and `usdlike.github.io`. They
 * all still resolve, which is the only reason nobody noticed: a free image host
 * and someone else's S3 bucket are not a CDN we control, and `next/image`
 * cannot optimise what it cannot fetch at build. Downloaded into `public/`,
 * where every other ported asset lives. 999 KB to 309 KB on the way in.
 */

export type TonVoteSlide = {
  /** Message key under `pages.tonVote.slider.slides`. */
  id: string
  image: { src: string; width: number; height: number }
}

/**
 * The three product screenshots.
 *
 * Dimensions measured with sharp after optimisation, not read off the legacy
 * markup — they are three different sizes, so a single declared aspect ratio
 * would shift the layout on two of them as they loaded.
 */
export const TON_VOTE_SLIDES: readonly TonVoteSlide[] = [
  { id: 'directory', image: { src: '/marketing/ton-vote/slides/slide-1.png', width: 1206, height: 923 } },
  { id: 'proposal', image: { src: '/marketing/ton-vote/slides/slide-2.png', width: 1137, height: 968 } },
  { id: 'space', image: { src: '/marketing/ton-vote/slides/slide-3.png', width: 1239, height: 1040 } },
]

/** The six feature cards, in legacy order. */
export const TON_VOTE_TOOLS = [
  { id: 'decentralized', image: '/marketing/ton-vote/tools/1.svg' },
  { id: 'gasless', image: '/marketing/ton-vote/tools/2.svg' },
  { id: 'advancedVoting', image: '/marketing/ton-vote/tools/3.svg' },
  { id: 'snapshot', image: '/marketing/ton-vote/tools/4.svg' },
  { id: 'manipulation', image: '/marketing/ton-vote/tools/5.svg' },
  { id: 'verifiableUi', image: '/marketing/ton-vote/tools/6.svg' },
] as const

export type TonVotePartner = {
  /** The project's own name. A proper noun, so not in the message catalogs. */
  name: string
  /** Their space on ton.vote. */
  href: string
  image: { src: string; width: number; height: number }
}

/**
 * The launch partners, in legacy order.
 *
 * Each links to that DAO's space rather than to the project's own site, which
 * is what the legacy page does and is the more useful destination from a page
 * about the voting tool.
 */
export const TON_VOTE_PARTNERS: readonly TonVotePartner[] = [
  {
    name: 'TON Foundation',
    href: 'https://ton.vote/EQCb8dxevgHhBnsTodJKXaCrafplHzAHf1V2Adj0GVlhA5xI',
    image: { src: '/marketing/ton-vote/partners/ton-foundation.png', width: 560, height: 560 },
  },
  {
    name: 'Evaa',
    href: 'https://ton.vote/EQDspA6XZrai7c5cuCUvGw1wfMuOdXvBSYuc8q8us94fs3Zw',
    image: { src: '/marketing/ton-vote/partners/evaa.png', width: 894, height: 726 },
  },
  {
    name: 'Fanzee',
    href: 'https://ton.vote/EQC5uEjI6iCQcjmoFh2KcUIUsQ7hb17hnK29NoEwtqTjEdlO',
    image: { src: '/marketing/ton-vote/partners/fanzee.png', width: 512, height: 512 },
  },
  {
    name: 'Praxis',
    href: 'https://ton.vote/EQCBefq4_WZfIBnyVrBeAp2BNJMBqQSLpWN3q53GLgX5zU-C',
    image: { src: '/marketing/ton-vote/partners/praxis.png', width: 200, height: 200 },
  },
  {
    name: 'STON.fi',
    href: 'https://ton.vote/EQAPWMrbP0K4yVvqqYdynUoelX-I6rDvWRmWJNFDchB4cUPW',
    image: { src: '/marketing/ton-vote/partners/stonfi.png', width: 200, height: 200 },
  },
  {
    name: 'USDLIKE',
    href: 'https://ton.vote/EQBjVl0e0tcbdwc-HhzYcU2CXnfbmeAiXEpMwFwRjk9taUfJ',
    image: { src: '/marketing/ton-vote/partners/usdlike.png', width: 750, height: 750 },
  },
]

export const TON_VOTE_IMAGES = {
  hero: '/marketing/ton-vote/hero.svg',
} as const

export const TON_VOTE_LINKS = {
  app: 'https://ton.vote/',
  github: 'https://github.com/orbs-network/ton-vote',
  telegram: 'https://t.me/TONVoteSupportGroup',
  /**
   * Internal, so it resolves through `localeHref` and the white-paper route
   * that already exists for this slug. The legacy button hardcodes
   * `https://www.orbs.com/white-papers/ton-vote/` — a self-referential absolute
   * URL, the same normalisation applied on #100 and the institutional page.
   */
  whitePaper: '/white-papers/ton-vote',
} as const
