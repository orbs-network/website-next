import snippets from './product-snippets.json'

/**
 * Code samples for the dTWAP, dLIMIT and notification pages.
 *
 * These are the legacy `assets/datasets/*-snippets.json` files, which the live
 * site fetches at runtime and renders with highlight.js. The port missed them
 * because the legacy React partial passes `code=""` — the panel looks empty in
 * the markup, and vanilla JS outside the React tree fills it in. Reading the
 * partial alone, as the first port did, the reasonable conclusion is that there
 * was never any code. There was. See #167.
 *
 * In the repo rather than in Contentful: they are source code for an SDK this
 * repo does not own, they change when that SDK changes, and a code sample is
 * not something an editor should be able to edit without review.
 *
 * NOT in the message catalogs either, which is the more interesting call. Code
 * is not copy — it is identical in English, Japanese and Korean, and putting it
 * in three catalogs would mean three copies for a translator to helpfully
 * "fix". The same reasoning as the contract addresses on `/smart-contracts`.
 *
 * Line endings are normalised to LF on the way in. The legacy files are CRLF
 * throughout, and a `\r` surviving into a `<pre>` renders as a stray character
 * at the end of every line.
 */

/** Two samples each for dTWAP and dLIMIT — the React component, then the styles. */
export type ProductSnippetTab = 'react' | 'styles'

/**
 * Keyed by page, then by tab id.
 *
 * The tab ids match the `code.reactTab` / `code.stylesTab` entries already in
 * the catalogs: the tabs were built in the first port, correctly labelled, and
 * have been showing prose where the code belongs ever since.
 */
export const PRODUCT_SNIPPETS: {
  dtwap: Record<ProductSnippetTab, string>
  dlimit: Record<ProductSnippetTab, string>
  notifications: { main_snippet: string }
} = snippets

/** The single sample on the notifications page — a `LowHealth` handler. */
export const NOTIFICATION_SNIPPET = snippets.notifications.main_snippet
