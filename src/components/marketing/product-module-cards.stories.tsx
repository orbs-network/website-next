import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { DSPOT_MODULES, DSPOT_MODULE_GRAPHICS } from '@/content/pages/dspot'
import en from '@/i18n/messages/en.json'
import ko from '@/i18n/messages/ko.json'
import { ProductModuleCards } from './product-module-cards'

function argsFor(locale: 'en' | 'ko') {
  const t = (locale === 'ko' ? ko : en).pages.dspot.modules
  return {
    id: 'modules',
    eyebrow: t.eyebrow,
    heading: t.heading,
    body: t.body,
    previousLabel: t.previous,
    nextLabel: t.next,
    locale,
    cards: DSPOT_MODULES.map(({ id }) => ({
      id,
      title: t[id].name,
      body: t[id].body,
      graphic: DSPOT_MODULE_GRAPHICS[id],
    })),
  }
}

const meta = {
  title: 'Marketing/ProductModuleCards',
  component: ProductModuleCards,
  args: argsFor('en'),
  parameters: {
    layout: 'fullscreen',
    viewport: {
      options: {
        desktop: { name: 'Desktop', styles: { width: '1440px', height: '900px' } },
        tablet: { name: 'Tablet', styles: { width: '768px', height: '900px' } },
        phone: { name: 'Phone', styles: { width: '320px', height: '900px' } },
      },
    },
  },
} satisfies Meta<typeof ProductModuleCards>
export default meta
type Story = StoryObj<typeof meta>

const checkRail: NonNullable<Story['play']> = async ({ canvasElement, args }) => {
  const canvas = within(canvasElement)
  const rail = canvas.getByRole('list', { name: args.heading })
  const cards = within(rail).getAllByRole('listitem')
  expect(cards).toHaveLength(4)
  expect(canvas.queryAllByRole('link')).toHaveLength(0)
  await waitFor(() => expect(canvas.getByRole('button', { name: args.previousLabel })).toBeDisabled())
  expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth)
  expect(rail.scrollWidth).toBeGreaterThan(rail.clientWidth)
  // A partially visible next card makes the scrolling affordance visible.
  const railBox = rail.getBoundingClientRect()
  const preview = cards
    .map((card) => card.getBoundingClientRect())
    .find((box) => box.left < railBox.right && box.right > railBox.right)
  expect(preview).toBeDefined()
  expect(railBox.right - preview!.left).toBeGreaterThanOrEqual(24)

  // The fourth card was outside the Figma frame. A mouse user must reach it.
  for (let n = 0; n < 4 && rail.scrollLeft < rail.scrollWidth - rail.clientWidth - 1; n++) {
    const settled = new Promise<void>((resolve) => rail.addEventListener('scrollend', () => resolve(), { once: true }))
    await userEvent.click(canvas.getByRole('button', { name: args.nextLabel }))
    await settled
  }
  await waitFor(() => expect(canvas.getByRole('button', { name: args.nextLabel })).toBeDisabled())
  expect(cards[3].getBoundingClientRect().right).toBeLessThanOrEqual(rail.getBoundingClientRect().right + 1)
  rail.scrollTo({ left: 0, behavior: 'instant' })
  await waitFor(() => expect(rail.scrollLeft).toBe(0))
  await waitFor(() => expect(canvas.getByRole('button', { name: args.nextLabel })).toBeEnabled())
  canvas.getByRole('button', { name: args.nextLabel }).focus()
  await userEvent.keyboard('{Enter}')
  await waitFor(() => expect(rail.scrollLeft).toBeGreaterThan(0))
}

export const Desktop: Story = { globals: { viewport: { value: 'desktop' } }, play: checkRail }
export const Tablet: Story = { globals: { viewport: { value: 'tablet' } }, play: checkRail }
export const Phone: Story = { globals: { viewport: { value: 'phone' } }, play: checkRail }
export const KoreanPhone: Story = { args: argsFor('ko'), globals: { viewport: { value: 'phone' } }, play: checkRail }
