import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { SlideCarousel } from './slide-carousel'

const meta = {
  title: 'Marketing/SlideCarousel',
  component: SlideCarousel,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof SlideCarousel>

export default meta
type Story = StoryObj<typeof meta>

const SLIDES = [
  {
    id: 'directory',
    caption: 'Every DAO space on TON in one searchable directory.',
    label: 'Show slide 1',
    image: { src: '/marketing/ton-vote/slides/slide-1.png', width: 1206, height: 923 },
  },
  {
    id: 'proposal',
    caption: 'A proposal with its voting options, live results and the countdown to close.',
    label: 'Show slide 2',
    image: { src: '/marketing/ton-vote/slides/slide-2.png', width: 1137, height: 968 },
  },
  {
    id: 'space',
    caption: 'A project’s own space page, with its proposals and their outcomes.',
    label: 'Show slide 3',
    image: { src: '/marketing/ton-vote/slides/slide-3.png', width: 1239, height: 1040 },
  },
]

const args = { slides: SLIDES, label: 'Customizable themed space pages' }

export const Default: Story = { args }

/**
 * One dot per slide, each with its own accessible name.
 *
 * Unnamed dots are the usual carousel failure: a screen-reader user hears
 * "button, button, button" and has no way to tell which is which or which one
 * they are on.
 */
export const EveryDotIsNamed: Story = {
  args,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    for (const slide of SLIDES) {
      await expect(canvas.getByRole('button', { name: slide.label })).toBeInTheDocument()
    }
  },
}

/** The slide you are on is exposed, not only coloured in. */
export const CurrentSlideIsExposed: Story = {
  args,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const currentDots = () => canvasElement.querySelectorAll('button[aria-current="true"]')

    await expect(currentDots()).toHaveLength(1)
    await expect(currentDots()[0].getAttribute('aria-label')).toBe('Show slide 1')

    await userEvent.click(canvas.getByRole('button', { name: 'Show slide 3' }))

    // `waitFor`, not `findByRole`. The dot exists the whole time — it is the
    // ATTRIBUTE that arrives late, because the click scrolls smoothly and the
    // marker follows the scroll event rather than the click. `findBy` retries
    // until the element appears, which it already has, so it would assert on
    // the first frame and fail.
    await waitFor(async () => {
      await expect(currentDots()[0].getAttribute('aria-label')).toBe('Show slide 3')
    })
  },
}

/**
 * The scroller has to be focusable.
 *
 * It scrolls, and a scroll container that cannot take focus cannot be scrolled
 * from the keyboard — 2.1.1, and the reason this is a `tabIndex={0}` list
 * rather than a plain `div` with `overflow-x-auto`.
 */
export const TheStripIsKeyboardReachable: Story = {
  args,
  play: async ({ canvasElement }) => {
    const scroller = canvasElement.querySelector('ul[aria-label]')

    await expect(scroller).toBeTruthy()
    await expect((scroller as HTMLElement).tabIndex).toBe(0)
  },
}

/**
 * Images are decorative because the caption beneath says the same thing.
 *
 * Giving both the same text makes a screen reader read every slide twice.
 */
export const ImagesDeferToTheirCaptions: Story = {
  args,
  play: async ({ canvasElement }) => {
    const images = canvasElement.querySelectorAll('img')

    await expect(images).toHaveLength(3)
    for (const image of images) {
      await expect(image.getAttribute('alt')).toBe('')
    }

    await expect(canvasElement.querySelectorAll('figcaption')).toHaveLength(3)
  },
}
