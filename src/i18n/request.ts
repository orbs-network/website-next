import { getRequestConfig } from 'next-intl/server'
import { DEFAULT_LOCALE, isLocale, type Locale } from './locales'

/**
 * Resolves messages for a request.
 *
 * There is no `[locale]` segment and no middleware here, so next-intl's usual
 * `requestLocale` (which reads the matched segment) is always `undefined`. The
 * locale instead arrives as the explicit `locale` option that server components
 * pass to `getTranslations({locale})` — every page knows its own locale from its
 * position in the route tree (`app/(jp)/jp/...` is Japanese, and so on), so
 * there is nothing to infer.
 *
 * That is deliberate rather than a workaround. Inferring the locale would mean
 * reading the request — a header or a cookie — and that opts every page out of
 * static prerendering. The whole archive is prerendered for SEO and speed, so
 * anything that forces dynamic rendering is disqualified.
 */
export default getRequestConfig(async ({ locale }) => {
  const resolved: Locale = locale && isLocale(locale) ? locale : DEFAULT_LOCALE

  return {
    locale: resolved,
    messages: (await import(`./messages/${resolved}.json`)).default,
  }
})
