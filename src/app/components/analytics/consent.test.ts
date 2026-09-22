import { describe, expect, it } from 'vitest'
import { CONSENT_STORAGE_KEY, GA_MEASUREMENT_ID, consentBootstrapScript, consentState } from './consent'

/**
 * The legacy site shipped a cookie banner whose Reject button wrote a
 * localStorage key that nothing ever read, while `gtag.js` sat in the document
 * head and tracked regardless. Every one of these assertions exists because the
 * equivalent claim was false there and nothing caught it.
 *
 * The failure mode is specific and silent: a banner that LOOKS like it works.
 * Nothing throws, the button responds, the panel closes, and the tag carries on
 * storing. Only reading the code, or watching the network, tells you otherwise.
 */

describe('consentState', () => {
  it('denies every storage signal when denied', () => {
    const state = consentState('denied')

    // security_storage is the deliberate exception below, so it is excluded
    // here rather than the list being hand-written and able to drift.
    for (const [signal, value] of Object.entries(state)) {
      if (signal === 'security_storage') continue
      expect(value, signal).toBe('denied')
    }
  })

  it('grants the measurement signals when granted', () => {
    const state = consentState('granted')

    for (const signal of ['analytics_storage', 'functionality_storage', 'personalization_storage'] as const) {
      expect(state[signal], signal).toBe('granted')
    }
  })

  it('NEVER grants an advertising signal, whatever the answer', () => {
    // The banner asks one question, and it is about analytics. An "Accept" is
    // consent to measurement; reading it as consent to advertising storage is
    // consent the visitor was never asked for, and contradicts the cookie
    // policy, which promises these stay denied regardless of the answer.
    //
    // This assertion is the whole reason the function takes a choice at all
    // rather than these three being written inline at the call site: it has to
    // be checkable that the choice does NOT reach them.
    for (const choice of ['granted', 'denied'] as const) {
      const state = consentState(choice)

      for (const signal of ['ad_storage', 'ad_user_data', 'ad_personalization'] as const) {
        expect(state[signal], `${signal} on ${choice}`).toBe('denied')
      }
    }
  })

  it('always grants security_storage', () => {
    // Fraud prevention and similar are permitted without consent. Declaring it
    // denied would be a claim about our own behaviour that is not true.
    expect(consentState('denied').security_storage).toBe('granted')
    expect(consentState('granted').security_storage).toBe('granted')
  })

  it('declares all four Consent Mode v2 signals', () => {
    // v2 treats an OMITTED signal as unset rather than denied, and unset
    // permits storage. A default missing `ad_user_data` is not a stricter
    // default — it is no default at all for that signal.
    const state = consentState('denied')

    for (const signal of ['ad_storage', 'ad_user_data', 'ad_personalization', 'analytics_storage']) {
      expect(state, signal).toHaveProperty(signal)
    }
  })
})

describe('the bootstrap script', () => {
  const script = consentBootstrapScript()

  it('sets the default to denied', () => {
    expect(script).toContain("gtag('consent','default'")
    expect(script).toContain('"analytics_storage":"denied"')
  })

  it('sets the default BEFORE reading storage', () => {
    // Order matters more than either line. If the stored-grant lookup threw
    // before the default was declared, the tag would come up unset — which
    // permits storage — and the visitor would be tracked despite never being
    // asked.
    expect(script.indexOf("'default'")).toBeLessThan(script.indexOf('localStorage'))
  })

  it('re-applies a stored grant, because Consent Mode has no memory', () => {
    // The choice persists in localStorage; the tag's consent state does not.
    // Every page load starts denied, so a visitor who accepted last week is
    // silently downgraded without this.
    expect(script).toContain("gtag('consent','update'")
    expect(script).toContain(`localStorage.getItem(${JSON.stringify(CONSENT_STORAGE_KEY)})==='granted'`)
  })

  it('guards the storage read, so a throw cannot swallow the default', () => {
    // `localStorage` throws outright when cookies are blocked. An exception
    // would take the rest of the script with it.
    expect(script).toContain('try{')
    expect(script).toContain('}catch(e){}')
  })

  it('does not reuse the legacy key', () => {
    // `gdpr_accepted` was written by a banner under which rejecting did
    // nothing, so it is not a record of informed consent — and the new site
    // serves the same domain, so it would be inherited.
    expect(script).not.toContain('gdpr_accepted')
    expect(CONSENT_STORAGE_KEY).not.toBe('gdpr_accepted')
  })

  it('is valid JavaScript', () => {
    // It is assembled as a string and injected verbatim. A syntax error here
    // fails silently in the browser, taking the consent default with it.
    expect(() => new Function(script)).not.toThrow()
  })
})

describe('the measurement ID', () => {
  it('is the property the legacy site reports to', () => {
    // Continuity is the point: a new property would restart the history that
    // decisions are made against.
    expect(GA_MEASUREMENT_ID).toBe('G-HJ74DHDLS3')
  })
})
