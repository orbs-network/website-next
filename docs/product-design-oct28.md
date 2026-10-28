# dSPOT and dPERPS — October 28 design refresh

Source: [Orbs Website 3.0](https://www.figma.com/design/bjKZGxtVtfiDImsqDXNHXd/Orbs-Website-3.0), version `2415371191829694440` (28 October 2026).

The page compositions are Templates nodes `2494:19487` (dSPOT) and `2461:16310` (dPERPS). Copy remains editable HTML from the English/Korean catalogs. Only decorative art is exported as SVG; complete page screenshots are not shipped.

## Scope decisions

- Exclude the entire dPERPS Overview/Symmio section, including its heading and copy, per Sarbloc. No empty placeholder or reserved space.
- Retain the approved dSPOT headline and eight solver/liquidity-source logos. The design's older headline and perps venue strip do not override those approvals.
- Retain unlinked product cards, existing product redirects, developer-doc destinations and both locales' risk disclosures.
- Match the dark desktop composition and adapt it to narrow screens. Light illustrations come from the detached handoff where available; no separate complete light/mobile page composition was supplied.

## Asset provenance

All new files live in `public/marketing/dspot/` and `public/marketing/dperps/` and are local/self-contained.

| Asset                | Figma source                                                                       | Treatment                                                                                                              |
| -------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| dSPOT execution hero | `2494:19499`, `2271:1734`                                                          | Current dark artwork and cropped light counterpart.                                                                    |
| dLIMIT module        | `2500:27198`, `2526:4806`                                                          | Dark card art; light chart panel isolated from detached handoff row.                                                   |
| dTWAP module         | `2500:27276`, `2526:4806`                                                          | Dark card art; light clock panel from handoff row.                                                                     |
| dSLTP module         | `2500:27454`, `2526:4806`                                                          | Dark card art; light action panel from handoff row.                                                                    |
| Liquidity Hub module | `2500:27418`, `2526:4345`                                                          | Fourth card artwork, which extends beyond the page frame, and detached light flow.                                     |
| dPERPS futures hero  | `2271:1777`, `2271:1782`                                                           | Editable vectors matching the current page artwork, with matching viewBoxes. Avoids the page export's embedded bitmap. |
| dPERPS network       | `2461:16493`                                                                       | Current page sphere; light version darkens visible white/grey lines, preserving masks and brand gradients.             |
| dPERPS security      | `2461:16625`                                                                       | Current page artwork; light version recolours visible white/grey lines, preserving masks and gradients.                |
| dPERPS venue         | `2461:16599`, `2271:1818`                                                          | Current dark artwork and light handoff counterpart.                                                                    |
| dPERPS benefit icons | `2461:16428`, `2461:16436`, `2461:16444`, `2461:16452`, `2461:16460`, `2461:16467` | Decorative icons only; pricing's parent export also contained copy, which is removed.                                  |

The existing shared glow and lavender CSS gradients are retained. No Symmio architecture assets, Figma tokens, raw API payloads or render URLs are shipped.

## Validation

A full site build needs Contentful credentials for the unrelated CMS pages. Without accessing secret files, a selective Next production build can prerender the changed English pages and Korean marketing routes:

```sh
npx next build --debug-build-paths 'src/app/(en)/dspot/page.tsx,src/app/(en)/dperps/page.tsx,src/app/(ko)/ko/[...rest]/page.tsx'
npm run start -- -p 3051
npm run check:overflow -- --base http://127.0.0.1:3051
```

This selective build is a local verification method, not a production deployment artifact. The normal production build remains unchanged.
