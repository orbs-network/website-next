import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ConsentBanner, resetConsentMemoryForTests } from './consent-banner'
import { CONSENT_STORAGE_KEY, consentState } from './consent'

/**
 * The banner, in a real browser.
 *
 * `consent.test.ts` covers the state the bootstrap declares; these cover what
 * happens when somebody presses a button, which is where the legacy
 * implementation failed. Its Reject wrote a key nothing read and closed the
 * panel — visually indistinguishable from this one.
 */

const LABELS = {
  message: 'We use cookies to measure how the site is used. Analytics stay off unless you accept.',
  accept: 'Accept',
  reject: 'Reject',
  policyLabel: 'Privacy policy',
  policyHref: '/privacy-policy/',
}

/**
 * `gtag` calls made by the story under test.
 *
 * Module-level and reset per story rather than returned from a helper, because
 * the setup has to run in `beforeEach` — see below — and `play` needs to read
 * what it recorded.
 */
let calls: unknown[][] = []

/**
 * Storage has to be primed BEFORE the component mounts, so this is `beforeEach`
 * rather than the first lines of `play`.
 *
 * Found by writing it the other way. Stories share one browser context, so
 * `Rejecting` mounted with the `granted` that `Accepting` had just stored, the
 * banner correctly hid itself, and `play` then cleared storage into a component
 * that had already decided not to render. The result was an empty canvas and a
 * confusing "unable to find button" — a setup bug that looks exactly like a
 * broken component.
 */
function prime(stored: string | null) {
  calls = []
  resetConsentMemoryForTests()
  ;(window as unknown as { gtag: (...args: unknown[]) => void }).gtag = (...args: unknown[]) => {
    calls.push(args)
  }

  if (stored === null) window.localStorage.removeItem(CONSENT_STORAGE_KEY)
  else window.localStorage.setItem(CONSENT_STORAGE_KEY, stored)
}

const meta = {
  title: 'Analytics/ConsentBanner',
  component: ConsentBanner,
  args: { labels: LABELS },
  beforeEach: () => prime(null),
} satisfies Meta<typeof ConsentBanner>

export default meta
type Story = StoryObj<typeof meta>

export const Undecided: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await waitFor(async () => {
      await expect(canvas.getByRole('button', { name: 'Accept' })).toBeVisible()
    })
    await expect(canvas.getByRole('button', { name: 'Reject' })).toBeVisible()
  },
}

export const Accepting: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await waitFor(async () => {
      await expect(canvas.getByRole('button', { name: 'Accept' })).toBeVisible()
    })
    await userEvent.click(canvas.getByRole('button', { name: 'Accept' }))

    // The choice is recorded AND the tag is told. Either alone is the legacy
    // bug: a stored flag nobody reads, or an update that does not survive a
    // reload.
    await waitFor(() => {
      expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toBe('granted')
    })
    expect(calls).toContainEqual(['consent', 'update', consentState('granted')])
    await expect(canvas.queryByRole('button', { name: 'Accept' })).toBeNull()
  },
}

export const Rejecting: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await waitFor(async () => {
      await expect(canvas.getByRole('button', { name: 'Reject' })).toBeVisible()
    })
    await userEvent.click(canvas.getByRole('button', { name: 'Reject' }))

    // THE one that matters. The legacy banner reached the first assertion and
    // never made the second — it closed, recorded a refusal, and let the tag
    // carry on regardless.
    await waitFor(() => {
      expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toBe('denied')
    })
    expect(calls).toContainEqual(['consent', 'update', consentState('denied')])
    await expect(canvas.queryByRole('button', { name: 'Reject' })).toBeNull()
  },
}

export const AlreadyAnswered: Story = {
  // A returning visitor. Primed before mount, which is the real sequence.
  beforeEach: () => prime('denied'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.queryByRole('button', { name: 'Accept' })).toBeNull()
    await expect(canvas.queryByRole('button', { name: 'Reject' })).toBeNull()
  },
}

export const AnotherTabAccepts: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await waitFor(async () => {
      await expect(canvas.getByRole('button', { name: 'Accept' })).toBeVisible()
    })

    // What another tab writing consent looks like from in here.
    window.localStorage.setItem(CONSENT_STORAGE_KEY, 'granted')
    window.dispatchEvent(new StorageEvent('storage', { key: CONSENT_STORAGE_KEY, newValue: 'granted' }))

    // Hiding the banner is the easy half. Consent Mode state is per DOCUMENT,
    // so without the update this tag stays denied until a reload — the visitor
    // consented and this tab quietly ignored it.
    await waitFor(async () => {
      await expect(canvas.queryByRole('button', { name: 'Accept' })).toBeNull()
    })
    expect(calls).toContainEqual(['consent', 'update', consentState('granted')])
  },
}

export const StorageWriteFails: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const setItem = window.localStorage.setItem.bind(window.localStorage)

    // Reads keep working, writes do not — an exhausted quota, in effect.
    window.localStorage.setItem = () => {
      throw new Error('QuotaExceededError')
    }

    try {
      await waitFor(async () => {
        await expect(canvas.getByRole('button', { name: 'Accept' })).toBeVisible()
      })
      await userEvent.click(canvas.getByRole('button', { name: 'Accept' }))

      // The choice cannot be kept, but it must still COUNT. Otherwise the
      // snapshot stays undecided, the banner never closes, and it returns on
      // every page for someone who has already answered.
      await waitFor(async () => {
        await expect(canvas.queryByRole('button', { name: 'Accept' })).toBeNull()
      })
      expect(calls).toContainEqual(['consent', 'update', consentState('granted')])
    } finally {
      window.localStorage.setItem = setItem
    }
  },
}
