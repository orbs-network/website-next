/**
 * Structural data for the Proof of Stake page. Copy lives under `pages.pos`.
 *
 * The legacy page is one bespoke `partials/pos-universe/*` layout per section.
 * What it actually contains is a hero, two role cards, a captioned shape grid
 * and a run of expandable explainers — shapes the library already has, or which
 * this page supplies once.
 */

/** The two network roles, in legacy order, with their marks and destinations. */
export const POS_ROLES = [
  { id: 'guardian', image: '/marketing/pos/guardians.svg', href: 'https://guardians.orbs.network/' },
  { id: 'delegator', image: '/marketing/pos/delegators.svg', href: 'https://staking.orbs.network/' },
] as const

/**
 * The six captioned shapes.
 *
 * Decorative marks beside a caption — the caption carries the meaning, so the
 * images are `alt=""` and the text is what a reader hears.
 */
export const POS_GRID = [1, 2, 3, 4, 5, 6].map((n) => ({
  id: `item${n}`,
  image: `/marketing/pos/shapes/shape${n}.svg`,
}))

/**
 * The expandable explainers, in legacy order.
 *
 * `item7` is deliberately absent: the legacy `third-flex` lists items 1-6 and
 * 8, skipping 7, and item-9 belongs to a different section. Reproduced rather
 * than tidied, because the omission is what the published page does.
 */
export const POS_EXPLAINERS = ['item1', 'item2', 'item3', 'item4', 'item5', 'item6', 'item8'] as const

/**
 * The two call-to-action links under the roles.
 *
 * The first is a blog post. The legacy content links it as an ABSOLUTE
 * https://www.orbs.com URL, which would leave the site to reach a page this
 * site serves — and after the DNS cutover (#39) would leave and come straight
 * back. Written as an internal path instead.
 *
 * The second points at a white paper migrated in #132; verified to resolve.
 */
export const POS_LINKS = [
  { id: 'v3', href: '/PolygonStakingDate' },
  { id: 'v25', href: '/white-papers/orbs-pos-v2-the-age-of-guardians' },
] as const
