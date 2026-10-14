# Full Ecosystem wordmarks

Source audit: 14 October 2026. The operator directed use of the old `orbs-network/website` repository's `assets/img/ecosystem` folder. Its latest main at `b5bd25515` contains full PancakeSwap, SushiSwap, QuickSwap and SpookySwap logos, but not the newer partner inventory.

- PancakeSwap: `assets/img/ecosystem/defi/pancake.svg`.
- SushiSwap: `assets/img/ecosystem/defi/sushiswap.svg`.
- QuickSwap: `assets/img/ecosystem/defi/quickswap.svg`.
- SpookySwap: `assets/img/ecosystem/defi/spookyswap.svg`.
- THENA: existing colour SVG from `public/marketing/liquidity-hub/thena-logo.svg`.
- Lynex and SwapX: Sara's retained `orbs-institutional-v2/orbs-institutional/05-venues-section` SVG exports. These full wordmarks are natively monochrome; both supplied geometry and brand names are preserved.

The first three old SVGs contain embedded PNGs rather than vector paths. Render their complete SVG at double density, retaining transforms, crop and aspect ratio. SushiSwap's edge-connected white backdrop is removed and its white lettering counters are matted to transparency. White parts enclosed within the coloured symbol are retained. Dark variants change only lettering after the transparent icon/text gutter (x=66/73/67 respectively); symbol RGBA and the entire alpha silhouette are identical between themes. No wordmark lettering is recreated with fonts.

SpookySwap stays a true vector: its first six colour-symbol paths are identical in both variants, with only the final lettering path changed to light ink for dark mode. THENA's original pink is used in both themes. Lynex and SwapX use dark/light ink variants of Sara's full vector geometry. Carbon, Gryps, OpenOcean and Sei already have full wordmarks elsewhere and remain in use.

## Missing approved full wordmarks

These are absent from the specified old ecosystem folder and retained partner SVG exports. Their current symbol assets remain until the full artwork is supplied; no approximated wordmarks are invented.

- Venues: TrebleSwap, Atlantis, Ramses, Kodiak, DragonSwap, SparkDEX, Shadow, Ring.
- Solvers/liquidity sources: Odos, Velora, KyberSwap, Rango, DODO, Lumia, Magpie.

The old folder's `kyber.svg` says Kyber Network, not KyberSwap, so it is not substituted for that product. Its wallet `carbon.png` is an unrelated wallet, not the approved Carbon venue. Chain logos remain the existing approved marks; the old chain folder also primarily supplies symbols.

Ring is the one symbol correction in this pass: Sara's `Orbs Website 3.0 (10)/Ring Protocol.svg` supplies its approved circle mark, with light/dark artwork cropped from the component set at the original symbol bounds and rendered at 120px. It replaces the app/favicon artwork with Sara's explicitly labelled Ring Protocol mark. This set does not contain a Ring wordmark, so Ring remains listed among the outstanding full wordmarks.

Blackhole reuses Sara’s existing full white wordmark from `public/marketing/institutional/venue-blackhole.png`. It is resized to 640px for sharp lettering, with an identical-alpha dark-ink variant for light mode.
