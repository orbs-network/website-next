/**
 * Google Consent Mode v2 state, kept free of React so it can be tested and so
 * the banner and the bootstrap script cannot disagree about what "granted"
 * means.
 *
 * WHY CONSENT MODE RATHER THAN A SWITCH. Loading `gtag.js` only after a visitor
 * accepts is the other reasonable design. Consent Mode is chosen because the tag
 * is then present from the first paint and simply not permitted to store
 * anything: the deny-to-grant transition happens in one call instead of a script
 * load, so a visitor who accepts is measured from that moment rather than from
 * whenever the network gets around to it. Nothing is written to the device until
 * they do.
 *
 * WHAT THE LEGACY SITE DID, because it is the reason this exists. It shipped a
 * cookie banner with Accept and Reject buttons. `handleAccept` wrote
 * `gdpr_accepted: true` to localStorage and `handleReject` wrote `false` — and
 * NOTHING EVER READ THAT KEY. `analytics.init()` ran unconditionally, and the
 * `gtag.js` tag sat in the document head regardless, so it had already loaded
 * before the banner rendered. Rejecting did nothing at all. Verified by reading
 * `assets/js/services/gd.js` and `assets/js/index.js` in the legacy repo.
 */

/** The live property, shared with the legacy site so history stays continuous. */
export const GA_MEASUREMENT_ID = 'G-HJ74DHDLS3'

/**
 * Where the choice is stored.
 *
 * Deliberately NOT the legacy `gdpr_accepted`, even though the new site will
 * serve the same domain and would inherit it. An "accept" recorded there was
 * given against a banner reading "by continuing to use our site, you accept our
 * cookie policy", under which rejecting had no effect — that is not a record of
 * informed consent, and silently honouring it would carry the old banner's
 * problem forward under a new one's name. Everyone is asked once, cleanly.
 */
export const CONSENT_STORAGE_KEY = 'orbs.analytics-consent.v1'

export type ConsentChoice = 'granted' | 'denied'

/**
 * The Consent Mode v2 signals, and what each is set to.
 *
 * `security_storage` is always granted: it covers things like fraud prevention
 * that a site is permitted to do without consent, and denying it would be a
 * claim about our own behaviour that is not true.
 *
 * The advertising signals are here even though the site runs no ad tags. v2
 * requires them to be declared, and a default that omits one is treated as
 * unset rather than denied — which is the opposite of the intent.
 *
 * THEY ARE ALWAYS DENIED, and never follow the choice. The banner asks one
 * question — "Analytics stay off unless you accept" — so an "Accept" is consent
 * to measurement and nothing else. Passing `choice` through to the three ad
 * signals turned that single answer into advertising consent the visitor was
 * never asked for, and contradicted the cookie policy in the same repo, which
 * states that advertising storage is denied regardless of the answer
 * (`src/content/legal/cookies.en.md`). The policy was right; this was the bug.
 *
 * If the site ever does run an ad tag, this needs a SECOND question in the
 * banner, not a widened meaning for the existing one.
 */
export function consentState(choice: ConsentChoice) {
  return {
    ad_storage: 'denied' as const,
    ad_user_data: 'denied' as const,
    ad_personalization: 'denied' as const,
    analytics_storage: choice,
    functionality_storage: choice,
    personalization_storage: choice,
    security_storage: 'granted' as const,
  }
}

/**
 * The inline bootstrap, as a string.
 *
 * This has to execute BEFORE `gtag.js` configures the property, or the tag
 * spends its first moments in Google's own default — which is "unset", not
 * "denied", and unset behaves like granted for storage. `@next/third-parties`
 * loads GA after hydration, so an inline script in the document body runs first.
 *
 * It also re-applies a stored grant. Consent survives a reload because it is in
 * localStorage, but Consent Mode itself has no memory: every page load starts
 * denied until something says otherwise, so a returning visitor who accepted
 * last week would be silently downgraded without this.
 *
 * Wrapped in try/catch because `localStorage` throws outright in a browser with
 * cookies blocked, and an exception here would take the whole script with it —
 * leaving the default consent command unsent, which is the one outcome worse
 * than not measuring the visit.
 */
export function consentBootstrapScript(): string {
  return `
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments)}
gtag('consent','default',${JSON.stringify(consentState('denied'))});
try{
  if(localStorage.getItem(${JSON.stringify(CONSENT_STORAGE_KEY)})==='granted'){
    gtag('consent','update',${JSON.stringify(consentState('granted'))});
  }
}catch(e){}
`.trim()
}
