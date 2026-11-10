import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'
import { Prose } from './prose'

/** The full beta disclosure stays visible, alongside its product-status heading. */
export function RiskDisclosure({
  eyebrow,
  title,
  text,
  locale,
}: {
  eyebrow: string
  title: string
  text: string
  locale: Locale
}) {
  return (
    <section className="container py-12 lg:py-24">
      <div className="grid gap-8 rounded-2xl border border-[#e6d9eb] bg-[#f8f5fa] p-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-16 lg:p-10 dark:border-[#39253d] dark:bg-[#18151c]">
        <div>
          <p
            className="text-detail font-medium uppercase tracking-wide text-accent-pink"
            lang={textLang(eyebrow, locale)}
          >
            {eyebrow}
          </p>
          <h2 className="mt-5 whitespace-pre-line text-3xl leading-tight text-fg" lang={textLang(title, locale)}>
            {title}
          </h2>
        </div>
        <Prose
          text={text}
          locale={locale}
          className="space-y-3 [&_p]:text-xs [&_p]:leading-relaxed [&_p]:text-fg-muted"
        />
      </div>
    </section>
  )
}
