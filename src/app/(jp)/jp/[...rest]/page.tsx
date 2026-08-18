import { notFound } from 'next/navigation'

/**
 * 404 catch-all for unmatched paths under this locale.
 *
 * Without it, a URL like `/jp/dtwap/` matches no route at all, and with three
 * root layouts there is no shared ancestor for Next to render a global
 * `not-found` into — so it falls through to a bare 7 KB error shell with no
 * header, nav or styling. Routing here instead puts the 404 inside this
 * locale's root layout, so it gets the right `lang` and the site chrome.
 *
 * This matters during the migration specifically: the legacy site serves
 * Japanese marketing URLs that Phase 3 has not rebuilt yet, so they are all
 * currently unmatched.
 *
 * Static and dynamic routes both take precedence over a catch-all, so the pages
 * Phase 3 adds will shadow this automatically.
 */
export default function LocaleCatchAll() {
  notFound()
}
