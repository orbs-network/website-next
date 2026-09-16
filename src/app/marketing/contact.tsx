import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { H1, H3, H4 } from '@/app/components/typography'
import { ContactForm, type ContactFormLabels } from '@/components/marketing/contact-form'
import { CONTACT_CHANNELS, CONTACT_EMAIL } from '@/content/pages/contact'
import { localeHref } from '@/i18n/availability'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

/**
 * The contact page.
 *
 * The form is genuinely translated in all three locales — `jp/contact/md/form.md`
 * and `ko/contact/md/form.md` are real translations down to the error strings
 * and the success message. The channel list is not: both locale pages point at
 * the SHARED `/contact/socials/index.md`, so the group titles and language
 * prefixes are English everywhere. The catalogs mirror that rather than
 * inventing translations, and `textLang` marks each of those strings as English
 * inside the Japanese and Korean documents — which is the whole reason that
 * helper exists (#103).
 *
 * Two legacy defects are corrected rather than reproduced, both in the Japanese
 * form: the given-name and family-name labels were transposed, and the submit
 * button read 登録 ("register") on a page that registers nothing. See the
 * catalog for the detail.
 */
export async function ContactPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'pages.contact' })
  const form = await getTranslations({ locale, namespace: 'pages.contact.form' })
  const channels = await getTranslations({ locale, namespace: 'pages.contact.channels' })

  const labels: ContactFormLabels = {
    firstName: form('firstName'),
    firstNamePlaceholder: form('firstNamePlaceholder'),
    lastName: form('lastName'),
    lastNamePlaceholder: form('lastNamePlaceholder'),
    email: form('email'),
    emailPlaceholder: form('emailPlaceholder'),
    phone: form('phone'),
    phonePlaceholder: form('phonePlaceholder'),
    message: form('message'),
    messagePlaceholder: form('messagePlaceholder'),
    submit: form('submit'),
    submitting: form('submitting'),
    required: form('required'),
    invalidEmail: form('invalidEmail'),
    invalidPhone: form('invalidPhone'),
    failed: form('failed', { email: CONTACT_EMAIL }),
    successTitle: form('success.title'),
    successBody: form('success.body'),
  }

  return (
    <section className="container mx-auto px-5 pt-16 pb-24">
      <div className="mx-auto max-w-3xl text-center">
        {/*
          `text-balance` because `text-h1` is a fixed size with no responsive
          step, so a short heading still wraps on a phone and the browser's
          greedy default leaves an orphan. Japanese showed it plainly:
          問い合わせ broke 4/1 at 390px. Balanced it is 3/2.
        */}
        <H1 className="text-balance" lang={textLang(t('hero.title'), locale)}>
          {t('hero.title')}
        </H1>
        <p className="mt-5 text-body text-fg-muted" lang={textLang(t('hero.subtitle'), locale)}>
          {t('hero.subtitle')}
        </p>
      </div>

      <div className="mt-16 grid gap-16 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div>
          {/*
            The form's own strings are translated, so the whole block takes the
            document language and only the exceptions are marked. The reverse —
            a `lang` per input — would be noise on three fully translated forms.
          */}
          <ContactForm labels={labels} locale={locale} />

          {/*
            The legacy page offers no address at all: the form is the only way
            through, and it has been posting into a dead Heroku service. A
            visible address means a failed send is an inconvenience rather than
            a lost enquiry.

            The address is a rich-text tag rather than a value in the catalog.
            Sentence order differs — English ends on the address, Japanese and
            Korean carry it mid-sentence — so a prefix string would not work,
            and putting `hello@orbs.com` in the copy would put it in three
            files. This way it is written once, in `content/pages/contact.ts`,
            beside the `mailto:` that has to match it.
          */}
          {/*
            No `lang`, and not by omission. This sentence is real copy in all
            three catalogs, so it takes the document's language. It also cannot
            be measured the usual way: `form('orEmail')` on a message containing
            tags does not return the text — next-intl falls back to the key path,
            which `textLang` reads as Latin script and marks `lang="en"` on a
            Japanese sentence. Checked in the rendered HTML.
          */}
          <p className="mt-8 text-detail text-fg-muted">
            {form.rich('orEmail', {
              address: () => (
                <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium transition-colors hover:text-link">
                  {CONTACT_EMAIL}
                </a>
              ),
            })}
          </p>
        </div>

        <aside>
          {/*
            An `h2` — it is the sibling of the form under the page's `h1` — but
            at `h3` size, because `text-h2` is a fixed 56px and this is a
            sidebar. `asChild` keeps the element and the scale independent
            rather than stacking two conflicting `text-*` utilities and hoping
            the merge resolves them the way round we want.
          */}
          <H3 asChild>
            <h2 lang={textLang(channels('title'), locale)}>{channels('title')}</h2>
          </H3>

          <div className="mt-8 flex flex-col gap-8">
            {CONTACT_CHANNELS.map((group) => (
              <section key={group.key}>
                <H4 lang={textLang(channels(`groups.${group.key}`), locale)}>{channels(`groups.${group.key}`)}</H4>

                <ul className="mt-3 flex flex-col gap-2">
                  {group.links.map((link) => {
                    const language = channels(`languages.${link.language}`)

                    return (
                      <li key={link.url} className="text-detail">
                        {/*
                          The language name and the handle are separate
                          elements, not one interpolated string. The name is
                          catalog copy in the reader's language; the handle is a
                          proper noun that is the same everywhere. Splitting
                          them is what lets `textLang` tell the truth about each
                          — and it keeps `@orbs_network` out of three catalogs.
                        */}
                        <span className="text-fg-muted" lang={textLang(language, locale)}>
                          {language}
                        </span>{' '}
                        {link.url.startsWith('/') ? (
                          <Link href={localeHref(link.url, locale)} className="transition-colors hover:text-link">
                            {link.label}
                          </Link>
                        ) : (
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-colors hover:text-link"
                          >
                            {link.label}
                          </a>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </section>
            ))}
          </div>
        </aside>
      </div>
    </section>
  )
}
