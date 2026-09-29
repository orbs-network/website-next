/**
 * Where everything SDK-related points: the SDK's own documentation.
 *
 * There is no SDK page on this site. The 3.4 design drew one and it was built
 * (#156), then withdrawn: the docs ARE the SDK's page. So the nav's "Execution
 * SDK/API" and the footer's "SDK/API" go here, and each product hero links to
 * its own section of it — see `PRODUCT_DEV_DOCS`.
 *
 * Not `docs.orbs.network`: that is the network's documentation — staking,
 * nodes, the L3 — and stays as the plain "Docs" link.
 */
export const SDK_DOCS_URL = 'https://docs.orbs.com/'

/** What a product hero's developer link offers, and so what it is labelled. */
export type DevDocsKind = 'sdk' | 'api' | 'skill'

export type DevDocsLink = { kind: DevDocsKind; href: string }

/**
 * The developer link on each product hero: one label, one deep link into the
 * part of the docs that product is.
 *
 * The docs are organised by what an integrator builds, not by our product
 * names, so the mapping is not one-to-one:
 *  - **Liquidity Hub** is the docs' "Swap".
 *  - **dTWAP, dLIMIT and dSLTP** share "Advanced Orders", which covers TWAP,
 *    limit, stop-loss and take-profit on one page with no per-type anchors.
 *  - **dSPOT** is both of those, so it gets the Spot guide chooser.
 *  - **Agentic** is for coding agents, so it gets the MCP skill.
 *
 * Each SDK link lands on the product's "Overview & Setup" page — the docs'
 * own "start here", which then picks between the SDKs and the bare API.
 *
 * dPERPS has no entry: the docs list Perps as "Coming soon". Add it when that
 * page exists rather than pointing its hero at a page that says nothing.
 */
export const PRODUCT_DEV_DOCS = {
  liquidityHub: { kind: 'sdk', href: `${SDK_DOCS_URL}liquidity-hub/shared` },
  dtwap: { kind: 'sdk', href: `${SDK_DOCS_URL}advanced-orders/shared` },
  dlimit: { kind: 'sdk', href: `${SDK_DOCS_URL}advanced-orders/shared` },
  dsltp: { kind: 'sdk', href: `${SDK_DOCS_URL}advanced-orders/shared` },
  dspot: { kind: 'sdk', href: `${SDK_DOCS_URL}#spot-guides` },
  agentic: { kind: 'skill', href: 'https://github.com/orbs-network/spot/tree/master/skill' },
} as const satisfies Record<string, DevDocsLink>

export type DevDocsProduct = keyof typeof PRODUCT_DEV_DOCS
