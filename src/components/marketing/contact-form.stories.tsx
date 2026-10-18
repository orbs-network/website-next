import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'
import { ContactForm, type ContactFormLabels } from './contact-form'

const meta = {
  title: 'Marketing/ContactForm',
  component: ContactForm,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ContactForm>

export default meta
type Story = StoryObj<typeof meta>

/** The English catalog copy, so the assertions read like the page does. */
const LABELS: ContactFormLabels = {
  firstName: 'First Name',
  firstNamePlaceholder: 'First name',
  lastName: 'Last Name',
  lastNamePlaceholder: 'Last name',
  email: 'Email',
  emailPlaceholder: 'Email',
  phone: 'Phone Number (optional)',
  phonePlaceholder: 'Phone number',
  contactType: 'Who are you? (optional)',
  contactTypePlaceholder: 'Select an option',
  contactTypes: { venue: 'Venue', institution: 'Institution', developer: 'Developer' },
  message: 'Message',
  messagePlaceholder: 'Something you want to tell us? Or maybe to ask?',
  submit: 'Submit',
  submitting: 'Sending…',
  required: 'Please fill the field',
  invalidEmail: 'Please insert valid email',
  invalidPhone: 'Please insert valid phone number',
  invalidContactType: 'Please select a valid option',
  failed: 'Something went wrong and your message was not sent.',
  successTitle: 'Thank you for reaching out!',
  successBody: 'We will contact you soon.',
}

const args = { labels: LABELS, locale: 'en' } as const

export const Default: Story = { args }

export const SelectedCategoryTravelsWithTheEnquiry: Story = {
  args,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const select = canvas.getByRole('combobox', { name: LABELS.contactType })
    await expect(
      within(select)
        .getAllByRole('option')
        .map((option) => option.textContent)
    ).toEqual([LABELS.contactTypePlaceholder, 'Venue', 'Institution', 'Developer'])
    await userEvent.selectOptions(select, 'developer')
    await userEvent.type(canvas.getByLabelText(LABELS.firstName), 'Ada')
    await userEvent.type(canvas.getByLabelText(LABELS.lastName), 'Lovelace')
    await userEvent.type(canvas.getByLabelText(LABELS.email), 'ada@example.com')
    await userEvent.type(canvas.getByLabelText(LABELS.message), 'Please help with an integration.')

    let payload: unknown
    const originalFetch = window.fetch
    window.fetch = async (input, init) => {
      if (input !== '/api/contact/') return originalFetch(input, init)
      payload = JSON.parse(String(init?.body))
      // Intercept the request completely. A failed send also lets us check that
      // the selection remains available for retry without sending real email.
      return Response.json({ ok: false }, { status: 502 })
    }
    try {
      await userEvent.click(canvas.getByRole('button', { name: LABELS.submit }))
      await expect(await canvas.findByRole('alert')).toBeInTheDocument()
      await expect(payload).toMatchObject({ contactType: 'developer', email: 'ada@example.com' })
      await expect(select).toHaveValue('developer')
      await expect(select).toBeEnabled()
    } finally {
      window.fetch = originalFetch
    }
  },
}

/**
 * Four errors: phone and category are optional and must not be reported as missing.
 */
export const EmptySubmitReportsEveryMissingField: Story = {
  args,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByRole('button', { name: 'Submit' }))

    await expect(await canvas.findAllByText(LABELS.required)).toHaveLength(4)
    await expect(canvas.queryByText(LABELS.invalidPhone)).toBeNull()
  },
}

/** A malformed address gets its own message, not "please fill the field". */
export const MalformedAddressGetsItsOwnMessage: Story = {
  args,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.type(canvas.getByLabelText(LABELS.email), 'nope')
    await userEvent.click(canvas.getByRole('button', { name: 'Submit' }))

    await expect(await canvas.findByText(LABELS.invalidEmail)).toBeInTheDocument()
  },
}

/**
 * Correcting a field clears its message straight away, and does not raise a new
 * one somewhere else while the reader is still mid-sentence.
 */
export const CorrectingAFieldClearsOnlyItsOwnError: Story = {
  args,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByRole('button', { name: 'Submit' }))
    await expect(await canvas.findAllByText(LABELS.required)).toHaveLength(4)

    await userEvent.type(canvas.getByLabelText(LABELS.firstName), 'Ada')

    await expect(await canvas.findAllByText(LABELS.required)).toHaveLength(3)
  },
}

/**
 * The regression this component is shaped around.
 *
 * Browser autofill and password managers can set an input's value WITHOUT
 * dispatching an input event — as can a fill applied to the prerendered markup
 * before React hydrates. Controlled inputs miss it entirely: the fields look
 * full, component state is empty, and the form refuses to send an enquiry the
 * reader can see in front of them.
 *
 * So the values are read from the form at submit rather than held in state, and
 * this sets them the way autofill does to prove it. Passing means validation
 * accepted them: no field errors, and the form moved on to the request — which
 * fails here, because a story has no route handler behind it. That failure IS
 * the assertion.
 */
export const AcceptsValuesSetWithoutAnInputEvent: Story = {
  args,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    for (const [name, value] of [
      ['firstName', 'Ada'],
      ['lastName', 'Lovelace'],
      ['email', 'ada@example.com'],
      ['message', 'Filled without an input event.'],
    ] as const) {
      const control = canvasElement.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${name}"]`)
      await expect(control).toBeTruthy()
      control!.value = value
    }

    await userEvent.click(canvas.getByRole('button', { name: 'Submit' }))

    await expect(await canvas.findByRole('alert')).toBeInTheDocument()
    await expect(canvas.queryByText(LABELS.required)).toBeNull()
    await expect(canvas.queryByText(LABELS.invalidEmail)).toBeNull()
  },
}

/**
 * The honeypot must not be reachable by keyboard or announced to a screen
 * reader. One that catches those readers is worse than not having one.
 */
export const HoneypotIsHiddenFromEveryone: Story = {
  args,
  play: async ({ canvasElement }) => {
    const honeypot = canvasElement.querySelector<HTMLInputElement>('input[name="company"]')

    await expect(honeypot).toBeTruthy()
    await expect(honeypot!.tabIndex).toBe(-1)
    await expect(honeypot!.closest('[aria-hidden="true"]')).toBeTruthy()
  },
}
