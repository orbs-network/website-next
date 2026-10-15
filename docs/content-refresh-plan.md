# October content refresh

Target: Friday, 16 October 2026. English first, confirmed by Sarbloc on 13 October. Japanese and Korean content updates follow separately; existing routes and catalogs remain available.

Source: Sara's “Orbs Website Refresh: Content Handoff” and [Orbs Website 3.0 in Figma](https://www.figma.com/design/bjKZGxtVtfiDImsqDXNHXd/Orbs-Website-3.0). Copy, agreed figures and explicit partner exclusions in the handoff take precedence over older design copy.

## Batch 1: entry points

- Home and Overview group dSPOT, dPERPS and Execution Services. The English header/footer list all three products. Existing capability URLs remain available.
- The homepage's three-card section owns `#products`; Overview links to it.
- Use 30+ venues, 10+ chains and 1.1B ORBS staked. Distinguish project history (2017), mainnet history (2019) and spot-product history (2023).
- Developer CTAs say “Start building”: trading links use the existing product guides at docs.orbs.com; Execution Services uses docs.orbs.network/v3.
- Homepage access paths: White label (Contact), Start building (trading docs), Orbs Agentic.
- Scope custody claims by product. Use “Any major custody provider” and “TWAP helps reduce price impact”.

## Batch 2: Network Overview and Execution Services

- Replace the English Overview's legacy pain/solution/mission/benefit narrative with the supplied L3, institutional execution and Guardians copy. Retain the three product destinations and add a staking CTA. Show project launch, mainnet launch and ORBS staking as separate figures.
- Replace English Execution Services copy with the supplied hero, Lambda/VM descriptions and two-model comparison. Preserve both logo variants and the existing split layout; replace the legacy AWS/evolution sections and graphs on English only.
- Preserve Japanese/Korean catalogs and page compositions. The retrieved Figma Network canvas supplies an Execution Services content-only frame, not a new dedicated Overview frame; Overview uses the approved shared inner-page layout.

## Batch 3: Venues and Ecosystem

- Venues: SushiSwap case study, supplied hero, callouts and CTAs. Ecosystem: curated integrations and chain lists. **Confirmed by Sara on 13 October:** the new English Ecosystem replaces the old broad directory entirely.

## Batch 4: FAQ and Security & Audits

- Replace the English general FAQ with the fourteen handoff answers. Preserve the Korean documents and the Japanese English fallback, with language tags and noindex still applied by the existing renderer and availability map.
- Add English-only `/security-and-audits/`: product-specific order authorisation, Guardians/PoS and staking, two AstraSec dSPOT reports, two earlier spot-contract reports, and source repositories. Each report's scope and version remain distinct from whole-platform coverage.
- Link from the FAQ, English Network menu, footer and homepage Discover section. The marketing registry supplies metadata, reserved-slug protection and sitemap inclusion.
- Keep the separate technical FAQ. Correct unconditional market/stop-loss execution promises, retain the conditional price-impact explanation, and align the staking figure with 1.1B ORBS.

## Follow-up

Ecosystem needs further design refinement, requested after Batch 3. Handle it in a separate PR.

## Hold: dSPOT and dPERPS

Sara is finishing both designs. Leave their page copy, layouts and artwork unchanged until she is ready. Shared chrome may reflect the new product grouping; shared renderer/data edits must preserve the existing product-page content and layout.

Before resuming, retrieve the completed Figma frames. Confirm the active solver roster and approved marks, obtain an official integration example, and reconcile diagrams with the new in-house/TEE narrative. Never publish placeholder code or restore struck-out integrations from old design comments.

## Delivery

Keep the earlier QA PR #291 separate. Use a fresh content-refresh branch. Check desktop/mobile and light/dark rendering, locale isolation, links and anchors; run tests, typecheck, lint, formatting, build and overflow checks. Obtain independent review of the final commit. Deployment remains with the operator; Friday is the target, not an automatic deployment instruction.

## October 15 supplied homepage/menu PDFs

Apply the English four-group Products / Tools / Solutions / Network menu and the new footer grouping. Playground is `https://swap.orbs.network/`; Team is explicitly omitted. Japanese/Korean menus, footer structure and homepage feature tabs retain their previous versions.

The corrected stats PDF controls the five figures, left alignment and “Project live” label. Replace English institutional tabs with the eight-item, four-by-two desktop grid, decorative icons, a light lavender gradient and centred CTAs; use a readable single-column phone layout.

Where the full homepage PDF still contains older material, preserve the approved three products, integration-path section, hero eyebrow/intro, product-qualified custody wording, 1.1B ORBS staking figure, launch dates and Security & Audits link. Keep real CMS articles instead of PDF placeholders. The new grid uses concise summaries while retaining product-specific custody and audit scope. These dispositions are part of the reviewable refresh rather than restoring the PDF's old 8-chain/100%-fill/$100M copy.

The mobile static dot grid uses native SVG patterns and is unmasked at rest, including without JavaScript and with reduced motion. Only an active ripple applies the hole mask. `node scripts/check-hero-grid.mjs --base <running-site>` checks actual painted pixels in Chromium; add `--browser webkit` for Safari's engine (`--executable` supports a local test wrapper). A physical iPhone check remains appropriate because Sara's exact device failure did not reproduce in current WebKit.
