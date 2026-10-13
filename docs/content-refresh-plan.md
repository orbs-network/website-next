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

## Remaining batches

1. Network Overview and Execution Services: apply the supplied full page copy and reconcile their Figma layouts.
2. Venues: SushiSwap case study, supplied hero, callouts and CTAs. Ecosystem: curated integrations and chain lists. **Pending Sara:** replace the existing broad directory or retain it as a secondary section.
3. General FAQ and a new Security & Audits page: fourteen answers, product-specific security explanations and scoped current/historical audit links.

## Hold: dSPOT and dPERPS

Sara is finishing both designs. Leave their page copy, layouts and artwork unchanged until she is ready. Shared chrome may reflect the new product grouping; shared renderer/data edits must preserve the existing product-page content and layout.

Before resuming, retrieve the completed Figma frames. Confirm the active solver roster and approved marks, obtain an official integration example, and reconcile diagrams with the new in-house/TEE narrative. Never publish placeholder code or restore struck-out integrations from old design comments.

## Delivery

Keep the earlier QA PR #291 separate. Use a fresh content-refresh branch. Check desktop/mobile and light/dark rendering, locale isolation, links and anchors; run tests, typecheck, lint, formatting, build and overflow checks. Obtain independent review of the final commit. Deployment remains with the operator; Friday is the target, not an automatic deployment instruction.
