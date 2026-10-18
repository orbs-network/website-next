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

## Six content URLs still require preservation

These have no content-equivalent destination. A generic redirect would hide
content loss:

- `/Orbs-Perpetual-Hub-Ultra-Integrates-with-QuickSwap/` — 24 June 2025 article.
- `/orbs-team-update-for-feb-2020/` — February 2020 article.
- `/tetra-orbs-staking-wallet-tutorial/` — historical staking tutorial. Its
  source date is blank; the existing migrator skips it. Confirm its original
  publication date before importing, rather than date it as a new post.
- `/challenge/`
- `/jp/challenge/`
- `/ko/challenge/`

The first three are live but unlisted posts and need a targeted Contentful
import, including their images. No Contentful management capability is
available in this session. The existing tool is
`scripts/orbs-website-migration/scripts/migrate-blogposts.mjs`; scope an import
to these entries and preserve the existing author IDs and asset handling.

The Challenge was a trading competition on 4–24 May 2026, with published prize
and eligibility rules. Recommend preserving it as an archived page in each
existing language, without implying that the competition is still open.
Archiving or retiring this campaign needs an editorial decision.

## Locale homepages remain a launch decision

The new `/jp/` and `/ko/` homepages return 200 with English placeholder body
copy, `noindex, follow`, and no sitemap entries. The live legacy homepages have
Japanese/Korean hero copy. Do not simply mark the new placeholders as translated
or advertise them as Japanese/Korean alternates.

Preserving localized homepages requires approved localized copy/composition;
consolidating them onto English instead requires an explicit SEO/content
decision. This issue remains open before DNS cutover.

## Other launch checks

- Sarbloc confirmed the mobile dot-grid fix works on 18 October; #315 is closed.
- The mobile blog overflow fix is tracked separately in #254 / #328.
- The operator is checking real enquiry delivery and newsletter membership.
- DNS backup, a publishing freeze, TLS/apex/www checks and rollback readiness
  remain part of the cutover, not this audit.

References: #38, #27, #39. Redirect/canonical/language handling follows
[Google's site-move guidance](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)
and [localized-page guidance](https://developers.google.com/search/docs/specialty/international/localized-versions).
