'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  SUBSCRIBE_HONEYPOT_FIELD,
  SUBSCRIBE_LIMITS,
  validateSubscribeMessage,
  type SubscribeErrors,
} from '@/lib/subscribe-message'
import { cn } from '@/lib/utils'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

/**
 * The home page's newsletter signup.
 *
 * Validation comes from `@/lib/subscribe-message`, the same module the route
 * imports, so the two cannot disagree about what a valid address is.
 *
 * VALUES ARE READ FROM THE DOM AT SUBMIT, not held in React state. A password
 * manager or browser autofill can write into an input without firing the events
 * React listens for, so a state-backed form submits blank fields for a visitor
 * who did nothing wrong — which is what happened to the contact form and is why
 * it works this way too.
 */

export type NewsletterLabels = {
  heading: string
  body: string
  name: string
  email: string
  submit: string
  sending: string
  success: string
  failed: string
  invalidEmail: string
}

type Status = 'idle' | 'sending' | 'sent' | 'failed'

export function NewsletterForm({ labels, locale }: { labels: NewsletterLabels; locale: Locale }) {
  const [errors, setErrors] = React.useState<SubscribeErrors>({})
  const [status, setStatus] = React.useState<Status>('idle')

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (status === 'sending') return

    const data = new FormData(event.currentTarget)
    const payload = {
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      [SUBSCRIBE_HONEYPOT_FIELD]: String(data.get(SUBSCRIBE_HONEYPOT_FIELD) ?? ''),
    }

    const result = validateSubscribeMessage(payload)

    if (!result.ok) {
      setErrors(result.errors)
      return
    }

    setErrors({})
    setStatus('sending')

    try {
      // Trailing slash: `trailingSlash: true` 308s the slashless form, and a
      // 308 does not preserve the method for every client.
      const response = await fetch('/api/subscribe/', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })

      setStatus(response.ok ? 'sent' : 'failed')
    } catch {
      setStatus('failed')
    }
  }

  if (status === 'sent') {
    return (
      <p className="text-p text-fg" role="status" lang={textLang(labels.success, locale)}>
        {labels.success}
      </p>
    )
  }

  const sending = status === 'sending'

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <Field
        name="name"
        label={labels.name}
        maxLength={SUBSCRIBE_LIMITS.name}
        autoComplete="name"
        disabled={sending}
        locale={locale}
      />
      <Field
        name="email"
        type="email"
        label={labels.email}
        maxLength={SUBSCRIBE_LIMITS.email}
        autoComplete="email"
        disabled={sending}
        error={errors.email ? labels.invalidEmail : undefined}
        locale={locale}
      />

      {/*
        The honeypot. Positioned off-screen rather than `display: none` —
        several bots skip hidden inputs but fill anything present in the markup.
        `aria-hidden` plus `tabIndex={-1}` keeps it out of the accessibility
        tree and the tab order, so nobody using a screen reader or a keyboard
        ever meets a field that means "you are a robot" if filled.
      */}
      <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="newsletter-company">Company</label>
        <input id="newsletter-company" name={SUBSCRIBE_HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex items-center gap-4">
        {/*
          Follows whichever label is showing. The two are separate catalog
          entries, and the button's text is its accessible name — a stale
          `lang` here is read aloud.
        */}
        <Button type="submit" disabled={sending} lang={textLang(sending ? labels.sending : labels.submit, locale)}>
          {sending ? labels.sending : labels.submit}
        </Button>

        {/*
          `role="status"` so a failure is announced rather than only shown. The
          form stays on screen with its values intact, because the usual reason
          to see this is a network blip and retyping an address is a poor
          reward for that.
        */}
        {status === 'failed' && (
          <p role="status" className="text-detail text-fg-muted" lang={textLang(labels.failed, locale)}>
            {labels.failed}
          </p>
        )}
      </div>
    </form>
  )
}

/**
 * One underlined input, as the design draws them: the field's name set large
 * on the underline, like a placeholder, until the reader focuses or fills it.
 *
 * It IS the label, not a placeholder. A placeholder disappears the moment
 * someone types, so anybody who loses their place — or returns to a half-
 * filled form — has to clear the field to find out what it wanted. This one
 * floats up to a small caption above the value instead and stays there.
 *
 * Pure CSS, keyed on `:placeholder-shown` (hence the single-space
 * placeholder): it is true exactly when the field is empty, including after
 * browser autofill, which writes a value without firing the events React
 * would need to track it — the same reason the form reads values from the DOM.
 * The label follows the input in the markup because `peer-*` can only look
 * backwards; `htmlFor` keeps it the input's accessible name either way.
 */
function Field({
  name,
  label,
  type = 'text',
  maxLength,
  autoComplete,
  disabled,
  error,
  locale,
}: {
  name: string
  label: string
  type?: string
  maxLength: number
  autoComplete: string
  disabled: boolean
  error?: string
  /** The document's locale. The label and the error derive their own `lang`. */
  locale: Locale
}) {
  const id = `newsletter-${name}`

  return (
    <div className="flex flex-col gap-2">
      <div className="relative pt-6">
        <input
          id={id}
          name={name}
          type={type}
          maxLength={maxLength}
          autoComplete={autoComplete}
          disabled={disabled}
          placeholder=" "
          aria-invalid={error !== undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            'peer w-full border-0 border-b bg-transparent pb-2 text-field font-light text-fg',
            'focus:outline-none focus:ring-0',
            error ? 'border-b-destructive' : 'border-b-border focus:border-b-accent-primary'
          )}
        />
        <label
          htmlFor={id}
          lang={textLang(label, locale)}
          className={cn(
            // Floated: the caption above a filled or focused field.
            'pointer-events-none absolute start-0 top-0 text-detail font-medium uppercase tracking-wide text-fg-muted',
            'transition-all duration-150 motion-reduce:transition-none',
            // Resting: set on the underline where the value will go. `peer-focus`
            // is generated after `peer-placeholder-shown`, so focus wins.
            'peer-placeholder-shown:top-6 peer-placeholder-shown:text-field peer-placeholder-shown:font-light',
            'peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal',
            'peer-focus:top-0 peer-focus:text-detail peer-focus:font-medium peer-focus:uppercase peer-focus:tracking-wide'
          )}
        >
          {label}
        </label>
      </div>
      {error && (
        <p id={`${id}-error`} className="text-detail text-destructive" lang={textLang(error, locale)}>
          {error}
        </p>
      )}
    </div>
  )
}
