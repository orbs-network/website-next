import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'
import { NewsletterForm } from './newsletter-form'

const meta = {
  title: 'Marketing/NewsletterForm',
  component: NewsletterForm,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof NewsletterForm>

export default meta
type Story = StoryObj<typeof meta>

const labels = {
  heading: 'Get updates from our team.',
  body: 'Get the latest Orbs news and updates straight to your inbox.',
  name: 'Your name',
  email: 'Your email address',
  submit: 'Sign up',
  sending: 'Signing up…',
  success: 'You are on the list. Thanks for subscribing.',
  failed: 'That did not go through. Please try again.',
  invalidEmail: 'Please enter a valid email address.',
}

const args = { labels, locale: 'en' as const }

export const Default: Story = { args }

/**
 * The field's name rests on the underline at input size, like a placeholder,
 * then floats up to a caption once the field has focus or a value — and stays
 * the input's accessible name throughout, which a real placeholder would not.
 */
export const LabelFloatsAndStaysVisible: Story = {
  args,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox', { name: 'Your name' })
    const label = canvasElement.querySelector<HTMLLabelElement>('label[for="newsletter-name"]')!
    const size = () => parseFloat(getComputedStyle(label).fontSize)

    const resting = size()
    await expect(resting).toBe(parseFloat(getComputedStyle(input).fontSize))

    await userEvent.type(input, 'Ada')
    await userEvent.tab()

    // Filled and blurred: still floated, still visible.
    await expect(size()).toBeLessThan(resting)
    await expect(label).toBeVisible()
    await expect(canvas.getByRole('textbox', { name: 'Your name' })).toHaveValue('Ada')
  },
}
