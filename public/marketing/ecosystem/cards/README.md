# Ecosystem card assets

Retrieved 14 October 2026. Native SVG geometry is preserved. Raster files are resized without enlargement to at most 256px. Existing homepage light-background logos and chain logos are reused.

- **trebleswap:** https://icons.llamao.fi/icons/protocols/treble
- **atlantis:** https://atlantisdex.xyz/_next/static/media/logo192.0936386f.png
- **lynex:** https://www.lynex.fi/favicons/lynex/favicon.png
- **ramses:** https://old.ramses.xyz/favicon/192x192_App_Icon.png
- **dragonswap:** https://www.saphyre.xyz/favicon.ico
- **sparkdex:** https://res.cloudinary.com/sparkdex/image/upload/f_svg/v1727753386/SparkDexLogo-sm_vv15k7.svg
- **shadow:** https://www.shadow.so/logo.svg
- **ring:** https://app.ring.exchange/images/192x192_App_Icon.png
- **odos:** https://odos.xyz/favicon.png
- **velora:** https://framerusercontent.com/images/FuxM2HJWypLor972lYSjEsyh7IA.svg
- **openocean:** https://app.openocean.finance/img/OpenOcean-Logo.81b4484b.svg
- **kyberswap:** https://kyberswap.com/favicon.png?version=v1
- **dodo:** https://app.dodoex.io/images/dodo-192x192.png
- **lumia:** https://lumia.org/favicon.svg
- **magpie:** https://cdn.prod.website-files.com/629b39872d72ff02443a529f/6491371dd08ddae77bddcf36_magpie-webclip.png
- **kodiak:** https://www.kodiak.finance/kodiak-logo.svg
- **blackhole:** https://blackhole.xyz/assets/blackhole-icon-XQCLaWSd.png
- **rango:** https://rango.exchange/icon1.png?2cd9a01a466b0afb
- **gryps:** https://gryps.finance/ (inline header SVG)

DragonSwap's PNG is decoded from the highest-resolution frame of the official Saphyre favicon ICO. Gryps is extracted from its site's inline header SVG. TrebleSwap's official site was inaccessible; its icon and profile are sourced from DefiLlama's Treble directory entry (https://defillama.com/protocol/treble).

## Social destinations

Profiles are taken from project websites, their official documentation or repository metadata. TrebleSwap and Carbon/IntentX are corroborated by DefiLlama entries. Display names retain Sara's approved inventory. Carbon means the former IntentX venue (https://defillama.com/protocol/intentx), not the unrelated Carbon DeFi project; it links to IntentX_. DragonSwap's current website is Saphyre and links to saphyre_xyz. OpenOcean's live app links to de1_ai. Magpie's site redirects to fly.trade but links to magpieprotocol. DODO's website and documentation link to DodoResearch. These current destinations are intentional, not inferred from display names.

The eight solver/liquidity-source names were explicitly approved by the operator on 14 October 2026. Their inclusion does not declare every-chain or every-order support. Product membership for venues remains sourced from src/content/shared/integrations.ts. Historical and upcoming entries are excluded from the current grid.

The reused Sei SVG now uses the default SVG namespace instead of `ns0:` prefixes, retaining every path and fill. This lets image tooling inspect the same native vector served to browsers.

## Dark cards

Cards use the existing surface token: white in light mode and Orbs neutral-700 (#29292b) in dark. Theme-specific sources keep lettering readable where required. Native monochrome Gryps, OpenOcean and Sonic artwork can render white through a dark-only brightness/invert filter; geometry and transparent negative space are preserved. Multicolour marks keep their source colours and alpha. The approved Carbon wordmark retains its existing light/dark source pair. No blanket colour inversion is applied to coloured branding.

## Colour refinement (14 October 2026)

The Ecosystem grid now prefers original brand colours. Other pages retain their current assets.

- PancakeSwap: https://pancakeswap.finance/logo.png
- SushiSwap: https://www.sushi.com/apple-touch-icon.png?v=1
- QuickSwap: https://quickswap.exchange/logo_circle.png
- SpookySwap: reuse the existing `/ecosystem/defi/spookyswap.svg`; crop its viewBox to the 31px colour symbol without changing paths or fills.
- THENA: https://thena.fi/favicon/apple-touch-icon.png
- SwapX: https://swapx.fi/swapx-logo.svg
- Ethereum, BNB Chain, Polygon PoS, Base, Arbitrum, Linea and Avalanche: reuse the original colour assets already held in `/marketing/agentic/chains/`, resized without enlargement to at most 256px in the card copies.
- Sei: https://cdn.sei.io/web-v2/sei-network-logo.svg. Retain the gold Network lettering. In the light variant only the white symbol/Sei lettering changes to dark ink; the site's original white/gold lockup is used in dark mode.
- Flare: https://flare.network/api/media/file/Flare.svg, retaining the official pink fill.
- Katana: https://katana.network/images/logomark.svg, retaining the official yellow in dark mode. Keep the existing dark-ink variant in light mode: fluorescent yellow on white would be invisible.

Carbon retains the approved Carbon bird wordmark; the older red IntentX favicon is a different identity and is not substituted. Gryps, OpenOcean and Sonic retain their native monochrome artwork and theme treatment. All other previously sourced multicolour marks retain their original colours. No colours are invented or inverted on multicolour marks.
