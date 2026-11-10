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

Fourteen standalone infographic SVGs are used without external image dependencies. Two additional closing-background SVGs carry the new themed glow artwork. The dPERPS dark hero export contained a raster copy of the existing artwork, so the existing native vector is retained. Hero image paths do not change, preserving the existing social-image mapping.

## Validation

Check first-fold geometry with the real header and both homepage languages, all five stats, both calls to action, pointer/reduced-motion behavior, card previews and navigation, loaded artwork, full legal disclosure, localized layouts, and page overflow at desktop, tablet and narrow phone widths. `HomeHero` also has a browser fixture so its English first fold can be checked without Contentful credentials. Existing facet-field stories cover its pointer behavior.

## Visual audit after the first review

The first review covered the main compositions and assets, but its layout checks
were incomplete. A second comparison against the captured Figma renders found
and corrected the following misses before merge:

- Home: prevent the next section entering a tall desktop first fold; match the
  introduction type and the wider, lower stats row.
- dSPOT: restore the full-width rail, approximately 500 × 440px desktop cards,
  40px inset, 16px gaps, larger card titles and a visible next-card preview.
- dPERPS: restore the 64px top inset and 96px section gaps, full-width feature
  band, feature typography, illustration columns and copy positions. Match the
  supplied gradient, 14px/23px disclosure type and paragraph spacing.
- Execution Services: match the 650px copy column, 164px gap and 560px interface
  illustration at the 1612px reference width, including the 150px gap before
  the closing CTA supplied outside the page frame.
- Restore foreground contrast in the dSPOT card descriptions and the supplied
  outer shadows around venue/Lambda/VM illustrations. The SVG exports retain
  their original bytes; CSS restores the glow clipped by SVG image boundaries.

### Comparison scope

The desktop reference width is 1612px. The audit covers the home hero and stats;
all four dSPOT illustrations and cards; all seven dPERPS sections and the closing
CTA; and the Execution Services hero, Lambda, VM and detached closing CTA.
Both supplied page themes are checked. Home has one supplied dark frame; its
light adaptation is checked for readability and layout, not claimed as a match
to a missing light reference. Detached siblings listed above are included when
checking closing content.

Artwork is checked against the original SVG exports, not recreated from a
screenshot. Rendered browser checks measure card geometry, section positions,
image loading, heading/disclosure typography, first-fold boundaries and
reachability. English home uses the actual `HomeHero` browser fixture because a
local full English homepage build requires Contentful credentials. Korean uses
the complete built application. Application and fixture comparisons also cover
1440, 1024, 768, 640, 390, 360 and 320px where applicable, plus tall desktop folds.
These are responsive adaptations; the supplied desktop frame is not a mobile
specification.

### Intentional differences from the frames

- Keep the approved home introduction and “Powering” wording. The pointer facet
  field remains interactive rather than showing the designer's static cursor.
- Keep the approved dSPOT headline “Advanced spot trading. Unified execution.”
  and its eight-solvers strip. The source frame still has the superseded
  headline and a six-venue strip. Other existing dSPOT sections remain the
  approved October composition; the November update concerns its light cards.
- Keep all dPERPS legal clauses and omit the entire previously excluded Symmio
  overview. Preserve approved casing. Headings wrap naturally; no forced line
  breaks are added to reproduce the desktop artwork. Different line endings at
  different viewport widths are expected and are not visual defects.
- Retain Korean translations and the Japanese archive composition. Figma's
  supplied English copy does not replace translated body text.
- Keep the shared header, navigation, footer, CTA destinations and working
  carousel/keyboard controls. Global chrome was not part of this refinement.
- Use the existing accessible pink token for the disclosure label in light mode;
  the pale source pink is too faint for small text. The shared marquee remains
  live content; the closing background now uses the new Figma artwork.

The comparison establishes checked scope and recorded exceptions. It is not a
promise that a designer will have no further feedback or that every responsive
viewport is pixel-identical to a fixed desktop frame.

To repeat the desktop composition checks against a built site or preview:

```sh
node scripts/check-refinement-layout.mjs --base http://localhost:3000
```

This checks the frame measurements in both themes and locales, including a
1200px-tall homepage fold. Run `npm run check:overflow -- --base <url>` for the
full narrow-screen route sweep; the component stories run in ordinary CI.

## Updated closing background

The shared closing CTA now uses the new glow from nodes `2553:3432` (dark) and
`2553:3543` (light). Their original vector paths, nested transforms, opacities
and blur layers are retained in `public/marketing/shared/closing-glow-*.svg`.
Each asset is approximately 4 KB with no raster payloads or external references.

The 954px-tall source background is anchored at the bottom of the closing block.
It scales with that block's width and extends upward, as in the detached Figma
artwork. On narrow screens it covers at least the block's natural height.
Foreground content clips horizontal marquee overflow separately, so the upper
glow is visible and the page does not acquire sideways scrolling. The decoration
stays hidden from assistive technology and cannot intercept pointer input.

Browser checks cover both actual SVG paints, theme selection, the upper fade,
background bounds, action focus/hit testing and mobile overflow. The old radial
approximation has been removed. No copy or CTA destinations change.
