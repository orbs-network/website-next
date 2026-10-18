# Cutover audit — 18 October 2026

The audit compared the current legacy repository and public website with the
Vercel deployment of `d8b33e5`. DNS still points to GitHub Pages. No DNS, email
or Contentful content was changed during the audit.

## Inventory and latest posts

- Legacy repository HEAD is still `b5bd2551507172bf7c7139f365d610bd64ad3788`
  (10 September 2026), verified against the remote.
- All 456 article URLs linked from the public legacy blog are in the deployed
  sitemap. The latest five also returned HTTP 200 on Vercel:
  - `/Ran-Hammer-Takes-the-Helm-at-Orbs/`
  - `/OIP-9-Passes-Over-350M-ORBS-Vote-to-Establish-the-Orbs-DAO/`
  - `/Ring-Protocol-integrates-dLIMIT-and-dTWAP-powered-by-Orbs/`
  - `/QuickSwap-Adopts-Orbs-Perpetual-Hub-Ultra-2-0/`
  - `/Establishing-the-Orbs-DAOs-First-Governance-Layer/`
- There are no newer posts to migrate from the old site today. This does not
  replace a publishing freeze or a last check immediately before DNS changes.
- A wider inventory from legacy `index.yml` files contains 625 normalized
  page URLs, including pages absent from the public blog list. Of these, 615
  already have a route, sitemap entry or redirect to an existing destination.
  That is route coverage, not 615 individual live HTTP requests.
- The ten uncovered URLs were checked against both hosts: all return 200 on
  legacy and 404 on the deployed new site.

## Four URL gaps addressed by this change

Two copies of existing articles receive permanent redirects to their verified,
published equivalents:

- `/Meta-Swap-Decentralized-AMM-Optimizer/` actually serves the Alpaca tutorial:
  its legacy article body is identical to
  `/how-to-use-the-orbs-pool-on-alpaca-finance/`.
- `/single-sided-farming/` is the older version of
  `/single-sided-farming-on-any-dex-via-orbs-liquidity-nexus-part-1/`, with the
  same article text and diagrams, apart from formatting and corrected links.

Two Japanese AI URLs are restored through the existing locale renderer:

- `/jp/ai/skills/`
- `/jp/ai/skills/spot-advanced-swap-orders/`

All 20 Japanese legacy source markdown files contain English, so these remain
English placeholders, with complete English catalog namespaces, `noindex` and
no Japanese hreflang claim. They preserve reachability rather than pretend to
be translations.

## Historical articles preserved

The two dated articles absent from the public blog list were imported into
Contentful on 18 October and verified through the deployed site's read path:

- `/Orbs-Perpetual-Hub-Ultra-Integrates-with-QuickSwap/` — original date
  24 June 2025.
- `/orbs-team-update-for-feb-2020/` — original date 1 February 2020.

Both return 200, appear in a fresh sitemap response, and retain working hero,
inline and author images.

`/tetra-orbs-staking-wallet-tutorial/` has no date in its source or publication
date metadata on the old site. It is preserved as a static, undated archive at
its original URL, outside the dated Contentful feed. The complete tutorial,
original author, 12 images and video link are retained. A visible archive
notice explains that the interface/instructions are historical and links to
current staking information. No publication date is inferred. The archive is
`noindex, follow` and excluded from the sitemap, like the expired campaigns.

Sarbloc approved preserving the expired Challenge on 18 October. The three
original URLs (`/challenge/`, `/jp/challenge/`, `/ko/challenge/`) now serve an
archive with a prominent closure notice, original prize/eligibility rules,
no live entry CTA, and `noindex, follow`. They are excluded from the sitemap.

## Locale homepages preserved

Sarbloc approved preserving the existing Japanese/Korean landing copy on
18 October. `/jp/` and `/ko/` now render their original translated hero copy
in the shared site layout, with locale-correct links and the Korean partner
strip. They are indexable with self canonicals, reciprocal language alternates
and sitemap entries. The new English homepage has not been presented as a
Japanese/Korean translation. Localizing that full refresh remains later work.

## Other launch checks

- Sarbloc confirmed the mobile dot-grid fix works on 18 October; #315 is closed.
- The mobile blog overflow fix is tracked separately in #254 / #328.
- The operator is checking real enquiry delivery and newsletter membership.
- DNS backup, a publishing freeze, TLS/apex/www checks and rollback readiness
  remain part of the cutover, not this audit.

References: #38, #27, #39. Redirect/canonical/language handling follows
[Google's site-move guidance](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)
and [localized-page guidance](https://developers.google.com/search/docs/specialty/international/localized-versions).
