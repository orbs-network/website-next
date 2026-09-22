import Script from 'next/script'
import { GoogleAnalytics } from '@next/third-parties/google'
import { GA_MEASUREMENT_ID, consentBootstrapScript } from './consent'
import { ConsentBanner, type ConsentBannerLabels } from './consent-banner'

/**
 * Whether this deployment should report to the analytics property.
 *
 * Production only. The property is shared with the live site, so a preview
 * deployment reporting into it would mix our own clicking-around into the
 * numbers somebody uses to make decisions — and there is no way to separate it
 * out afterwards.
 *
 * DECIDED AT BUILD TIME, and it is worth being precise about that because the
 * first version of this comment said "read at render time" and was wrong in the
 * way that matters. This is a server component on prerendered pages, so its
 * render IS the build — #71 all over again, written by the same hand that had
 * just fixed it. Found by setting `VERCEL_ENV` on the server only and watching
 * the tag never appear.
 *
 * Left as a build-time decision anyway, which is a real choice rather than a
 * shrug. Vercel sets `VERCEL_ENV` during the build, so each deployment bakes in
 * the answer for what it actually is. The gap is the same one #71 was about — a
 * preview artifact promoted to production keeps the preview's answer — and here
 * that means the site quietly stops reporting. That is the benign direction:
 * missing numbers are obvious in a dashboard, whereas preview traffic silently
 * polluting the live property is not, and cannot be unmixed afterwards.
 *
 * `VERCEL_ENV` is absent off Vercel, and the default there is NOT to report:
 * an unrecognised environment is more likely to be somebody's laptop.
 */
export function shouldReportAnalytics(): boolean {
  if (process.env.NEXT_PUBLIC_ANALYTICS === 'off') return false

  return process.env.VERCEL_ENV === 'production'
}

/**
 * Google Analytics 4, with Consent Mode v2 defaulting to denied.
 *
 * Two pieces, and the ORDER between them is the whole thing:
 *
 *  1. an inline script that declares the default consent state — denied — and
 *     re-applies a stored grant
 *  2. the tag itself, which `@next/third-parties` loads after hydration
 *
 * If the tag configured the property before step 1 ran, it would do so under
 * Google's own default, which is "unset". Unset is not denied: storage is
 * permitted. So the inline script is `beforeInteractive`, which the App Router
 * only honours in a root layout — and `RootShell`, its only caller, is exactly
 * that.
 */
export function Analytics({ consentLabels, lang }: { consentLabels: ConsentBannerLabels; lang?: string }) {
  /*
    ONE condition for the tag AND the banner, which is why the banner is
    rendered from here rather than beside it in the shell.

    Split across two call sites they drifted immediately: a preview deployment
    ships no tag but asked every visitor to make a tracking choice, then wrote a
    consent key recording an answer to a question that did not apply. A consent
    prompt is a statement about what the site is doing — making it while doing
    nothing is its own small dishonesty, and it is the kind that survives review
    because everything on screen looks right.
  */
  if (!shouldReportAnalytics()) {
    return null
  }

  return (
    <>
      <Script id="ga-consent-default" strategy="beforeInteractive">
        {consentBootstrapScript()}
      </Script>
      <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
      <ConsentBanner labels={consentLabels} lang={lang} />
    </>
  )
}
