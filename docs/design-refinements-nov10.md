# November 10 page refinements

Source: [Orbs Website 3.0](https://www.figma.com/design/bjKZGxtVtfiDImsqDXNHXd/Orbs-Website-3.0?node-id=2517-827), version `2420172105174691690`, modified November 10, 2026 at 09:21 UTC. References and original exports were captured before implementation, including siblings outside the page frames.

- Home: `2132:126662`. The desktop headline grows to 76px; its actions and five stats share the first fold. The original copy and interactive facet field remain. Smaller viewports use a fluid title and wrapping stats.
- dSPOT light: `2576:814`. Updated order illustrations and white rounded cards; the rail still shows part of the next card, keeps every card reachable, and has no product links. The approved solver strip and headline remain.
- dPERPS: `2461:16310` / `2580:961`. Updated artwork proportions, dashboard illustration and full risk-disclosure panel. Both themes use their supplied vectors. Existing legal text is unchanged; the excluded Symmio overview remains excluded.
- Execution Services: `2517:827` / `2521:827`. Shorter hero, Lambda and VM sections, supplied English copy and interface illustrations. The shared closing CTA includes the content supplied in detached groups `2553:3431` / `2553:3542`. Korean retains its translated body copy. Japanese retains its archive composition and assets.

## Vector sources

The light dSPOT diagrams are `2611:919`, `2611:920`, `2611:921` and `2576:1215`.

The dPERPS network diagrams are `2593:1340` / `2593:1447`; security is `2606:916` / `2606:917`; venue dashboards are `2600:951` / `2600:1095`.

The Execution Services Lambda illustrations are `2555:611` / `2572:880`; VM is `2555:662` / `2572:988`.

Fourteen standalone SVGs are used without external image dependencies. The dPERPS dark hero export contained a raster copy of the existing artwork, so the existing native vector is retained. Hero image paths do not change, preserving the existing social-image mapping.

## Validation

Check first-fold geometry with the real header and both homepage languages, all five stats, both calls to action, pointer/reduced-motion behavior, card previews and navigation, loaded artwork, full legal disclosure, localized layouts, and page overflow at desktop, tablet and narrow phone widths. `HomeHero` also has a browser fixture so its English first fold can be checked without Contentful credentials. Existing facet-field stories cover its pointer behavior.
