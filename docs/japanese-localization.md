# Japanese localization

## Editorial direction

- Use `Orbs` for the brand and `ORBS` for the token. Keep product names (dSPOT, dPERPS, dTWAP, dLIMIT, Orbs Agentic, Orbs Lambda, Orbs VM), code, contract identifiers and published PDF URLs intact.
- Follow the existing Japanese staking, contract and privacy-policy terminology: ステーキング, 流動性, スマートコントラクト, ガーディアン, デリゲータ. Explain new trading concepts in polite Japanese; use concise noun phrases for headings.
- Use 執行 for trade execution, 実行 for computational execution, 指値注文, 成行注文, 損切り, 利確, 無期限先物, ノンカストディアル and 自己管理 consistently.
- Keep product names in Latin script; use consistent Japanese labels for ordinary navigation and footer links. Translate descriptions, accessibility controls and forms. Keep the Japanese community blog and existing social destinations; do not copy Korean channel overrides.
- English is the source of current product facts; Korean is a cross-check for structure and meaning, not a reason to copy Korean-only wording. In particular, dSPOT funds stay in the wallet until execution, whereas dPERPS collateral is handled by self-custodial contracts. Do not turn execution conditions into unconditional fill guarantees.

## Coverage and exclusions

The public Japanese refresh includes Home, dSPOT, dPERPS, Agentic, Institutions, Venues, Overview, Execution Services, Ecosystem, Security & Audits, FAQ, Contact, Brand Assets, existing PoS/contract content, the Spot skill guide, the news wrapper and all 28 white-paper title/abstract pages. The detailed dTWAP/dLIMIT FAQ is translated as supporting documentation.

Historic Challenge/NFT/Tetra content and unlinked legacy product/use-case pages are not newly translated or reopened. Existing archive routes and published Japanese copy are retained. Product URLs and the redundant AI Skills index continue to redirect to localized dSPOT/Agentic; translation does not override product consolidation.

Published PDFs and CMS articles are not translated. Japanese news headings and navigation surround English CMS cards explicitly tagged `lang="en"`; news stays a noindex placeholder. Existing privacy-policy Japanese is retained. Source-language legal policies (including the English-only implementation-specific cookie policy and Hebrew accessibility declaration) retain their original language/fallback and indexing policy rather than being declared Japanese translations.

## Integration rules

- dPERPS section eyebrow strings are intentionally empty in Japanese. The main-branch renderer is retained without locale-specific suppression; English keeps its labels and layout spacing follows main.
- `/jp/` remains the URL prefix; `ja` remains the locale/language code.
- Add reachable translated pages through the shared registry/availability map, not duplicate renderers.
- News, pagination and white-paper interface copy is read from the locale catalogs, not embedded in shared renderers. Explicit locale lookup keeps pages prerenderable.
- Japanese FAQ documents carry explicit `/jp/` destinations for available translated internal pages; external URLs remain unchanged. Regression coverage checks rendered destinations rather than requiring raw URLs to equal English.
- Media webhooks invalidate all available news locales, including paginated routes.
- White-paper sitemap entries follow translated locales. Preserve the historical Japanese grant-paper spelling with an exact same-locale redirect, without a catch-all redirect to English.
- During main integration, retain upstream English/Korean behavior and content plus explicitly requested locale copy changes. Japanese-only copy must not alter global social URLs or CMS behavior.
- Blog exclusion and empty CMS fixtures are for the disposable local preview only and must never enter source commits.

## Validation

Run the Node and Chromium/Storybook suites, formatting, ESLint, route type generation and TypeScript. Verify Japanese public routes, product redirects, footer Media/Blog links, white-paper details and desktop/mobile light/dark rendering in the isolated preview. A fixture-backed preview does not validate live Contentful publishing.

## November main integration preview

- Main revision `ef00130` supplies the shared layouts, product graphics and social metadata. Existing Japanese translations remain including the newly added or semantically changed strings, now translated in the Japanese catalog.
- Newly translated copy covers dPERPS marquee/risk headings, Execution Services function/service descriptions and labels, dSPOT order navigation, while the standardized SDK CTA remains `Start building`.
- Japanese Contact subtitle is an empty catalog string. Its contact-type label is restored visibly: blanking it would remove the select's accessible name, and locale-specific hiding code is not retained.
- Japanese dPERPS eyebrows remain empty strings without custom suppression or spacing code. The Overview section is removed by upstream for all locales, not by a translation override.

## PR 374 review follow-up

- The expanded Japanese availability is intentional: this is the planned full public-page follow-up, including both FAQs and all white-paper title/abstract pages. Published PDFs and CMS articles remain in their source languages.
- Korean dPERPS eyebrow values are restored to main; any Korean-only hiding change belongs in a separate PR.
- Use チームに相談する for both “Talk to the team” and “Talk to us”; MEV対策, ガス代不要, レポート作成と監査証跡, 自社ブランド and 監査報告書 consistently. Use プルーフ・オブ・ステーク and デリゲータ in Japanese prose.
- The dSPOT execution heading describes aiming for optimal execution conditions, rather than using 最良執行 as a regulatory claim. This is an editorial clarification, not a legal-compliance certification or an execution guarantee.
- News cards retain English CMS headlines and accessible link names. Dates use the page locale and carry their own language attribute.
- Unused Japanese Overview legacy product cards/marquee/closing/tech title and Execution Services alternatives/evolution keys were removed after checking their renderers. The absence regression check retains the old heading as a test fixture, not as live catalog copy.
