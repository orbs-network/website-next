'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { H3 } from '@/app/components/typography'
import {
  CONTACT_LIMITS,
  HONEYPOT_FIELD,
  validateContactMessage,
  type ContactErrors,
  type ContactField,
  type ContactFieldError,
} from '@/lib/contact-message'
import type { Locale } from '@/i18n/locales'

/**
 * The contact form.
 *
 * Takes resolved strings rather than calling `useTranslations`, the same as the
 * footer's children: there is no `[locale]` segment and no middleware, so
 * next-intl's hooks cannot resolve the locale from the request and would
 * quietly return English. The server component above this one knows the locale
 * and does the lookups.
 *
 * Validation comes from `@/lib/contact-message` — the same module the route
 * handler uses. Reimplementing the rules here is how a form ends up accepting
 * something its own handler discards.
 */

export type ContactFormLabels = {
  firstName: string
  firstNamePlaceholder: string
  lastName: string
  lastNamePlaceholder: string
  email: string
  emailPlaceholder: string
  phone: string
  phonePlaceholder: string
  message: string
  messagePlaceholder: string
  submit: string
  submitting: string
  required: string
  invalidEmail: string
  invalidPhone: string
  /** Shown when the request itself failed. Already carries the fallback address. */
  failed: string
  successTitle: string
  successBody: string
}

type Status = 'idle' | 'sending' | 'sent' | 'failed'

/**
 * `tooLong` is not reachable from this form — every input carries the matching
 * `maxLength`, so the browser stops the reader before the validator sees an
 * over-long value. It falls through to the generic message only to keep the
 * mapping total. The server, which can see it on a request that did not come
 * from here, drops it without any message at all.
 */
function fieldError(field: ContactField, reason: ContactFieldError, labels: ContactFormLabels): string {
  if (reason === 'invalid' && field === 'email') return labels.invalidEmail
  if (reason === 'invalid' && field === 'phone') return labels.invalidPhone

  return labels.required
}

/**
 * The submitted values, read from the form itself.
 *
 * Uncontrolled, deliberately. The inputs are the truth about what the reader
 * sees; component state is a copy of it that can be wrong. Browser autofill is
 * the case that matters — a fill applied to the prerendered markup before React
 * hydrates, or by a password manager that sets the value without dispatching an
 * event, leaves state empty while the fields look full. The form would then
 * validate as blank and refuse to send an enquiry the reader could see in front
 * of them.
 *
 * It is the same reason the honeypot is read here rather than held in state: a
 * script that types into the real input has to be visible to us.
 */
function submitted(form: HTMLFormElement, locale: Locale) {
  const data = new FormData(form)
  const field = (name: string) => {
    const value = data.get(name)
    return typeof value === 'string' ? value : ''
  }

  return {
    firstName: field('firstName'),
    lastName: field('lastName'),
    email: field('email'),
    phone: field('phone'),
    message: field('message'),
    locale,
    [HONEYPOT_FIELD]: field(HONEYPOT_FIELD),
  }
}

export function ContactForm({ labels, locale }: { labels: ContactFormLabels; locale: Locale }) {
  const [errors, setErrors] = React.useState<ContactErrors>({})
  const [status, setStatus] = React.useState<Status>('idle')

  const clearError = (field: ContactField) => () => {
    // Clear this field's error as it is corrected, rather than leaving it until
    // the next submit. Only clears — typing into one field never re-validates
    // another, so nothing new appears while the reader is mid-sentence.
    setErrors((current) => {
      if (!current[field]) return current

      const next = { ...current }
      delete next[field]
      return next
    })
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (status === 'sending') return

    // Read before anything sets `sending`. Disabling an input removes it from
    // `FormData`, so the order here is not incidental.
    const payload = submitted(event.currentTarget, locale)
    const result = validateContactMessage(payload)

    if (!result.ok) {
      setErrors(result.errors)
      setStatus('idle')
      return
    }

    setErrors({})
    setStatus('sending')

    try {
      // The trailing slash is load-bearing. `trailingSlash: true` means
      // `/api/contact` answers with a 308 to `/api/contact/`, and while a 308
      // does preserve the method and body, it makes every submission two round
      // trips through the redirect. Measured locally: POST to the slashless
      // path returns 308, the slashed one returns the handler's 200.
      const response = await fetch('/api/contact/', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        setStatus('failed')
        return
      }

      // No reset needed: the form unmounts and the success panel takes its
      // place.
      setStatus('sent')
    } catch {
      // Offline, or the request was blocked. Same outcome for the reader either
      // way: the message did not arrive and they should try again or email us.
      setStatus('failed')
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-sm border border-border p-8" role="status">
        <H3>{labels.successTitle}</H3>
        <p className="mt-3 text-body text-fg-muted">{labels.successBody}</p>
      </div>
    )
  }

  const sending = status === 'sending'

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          name="firstName"
          autoComplete="given-name"
          maxLength={CONTACT_LIMITS.name}
          label={labels.firstName}
          placeholder={labels.firstNamePlaceholder}
          onChange={clearError('firstName')}
          error={errors.firstName && fieldError('firstName', errors.firstName, labels)}
          disabled={sending}
        />
        <Field
          name="lastName"
          autoComplete="family-name"
          maxLength={CONTACT_LIMITS.name}
          label={labels.lastName}
          placeholder={labels.lastNamePlaceholder}
          onChange={clearError('lastName')}
          error={errors.lastName && fieldError('lastName', errors.lastName, labels)}
          disabled={sending}
        />
        <Field
          type="email"
          name="email"
          autoComplete="email"
          maxLength={CONTACT_LIMITS.email}
          label={labels.email}
          placeholder={labels.emailPlaceholder}
          onChange={clearError('email')}
          error={errors.email && fieldError('email', errors.email, labels)}
          disabled={sending}
        />
        <Field
          type="tel"
          name="phone"
          autoComplete="tel"
          maxLength={CONTACT_LIMITS.phone}
          label={labels.phone}
          placeholder={labels.phonePlaceholder}
          onChange={clearError('phone')}
          error={errors.phone && fieldError('phone', errors.phone, labels)}
          disabled={sending}
        />
      </div>

      <Textarea
        name="message"
        maxLength={CONTACT_LIMITS.message}
        label={labels.message}
        placeholder={labels.messagePlaceholder}
        onChange={clearError('message')}
        error={errors.message && fieldError('message', errors.message, labels)}
        disabled={sending}
      />

      {/*
        The honeypot. Hidden from sight, from the accessibility tree and from
        the tab order, so the only things that fill it are scripts reading the
        markup. `aria-hidden` plus `tabIndex={-1}` is what keeps it from being a
        trap for screen-reader and keyboard users — a honeypot that catches them
        is worse than no honeypot.

        Not `display: none`: some bots skip fields they can tell are hidden that
        way, and the check is cheap enough to be worth making slightly harder to
        spot.
      */}
      <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      {status === 'failed' ? (
        <p role="alert" className="text-detail text-coral-500">
          {labels.failed}
        </p>
      ) : null}

      <div>
        <Button type="submit" size="lg" disabled={sending}>
          {sending ? labels.submitting : labels.submit}
        </Button>
      </div>
    </form>
  )
}
