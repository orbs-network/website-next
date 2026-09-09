import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { DiagramSection } from './diagram-section'

const meta = {
  title: 'Marketing/DiagramSection',
  component: DiagramSection,
} satisfies Meta<typeof DiagramSection>

export default meta
type Story = StoryObj<typeof meta>

const IMAGE = '/marketing/dsltp/graph.png'
// The real asset's dimensions: 2.73:1, which is what made a fixed 16:9
// container leave a third of its height empty.
const SIZE = { width: 2666, height: 978 }
const ALT = 'A candlestick price chart with a take-profit level above the entry price and a stop-loss below it.'

export const WithTitle: Story = {
  args: { title: 'Recent and Ongoing Integrations', image: IMAGE, imageAlt: ALT, ...SIZE },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByRole('heading', { level: 2, name: 'Recent and Ongoing Integrations' })).toBeInTheDocument()
    await expect(canvas.getByRole('img', { name: ALT })).toBeInTheDocument()
  },
}

/**
 * The legacy `section-2/index.md` carries an empty `title:`, so that section is
 * the diagram alone — no heading element at all rather than an empty one.
 */
export const WithoutTitle: Story = {
  args: { image: IMAGE, imageAlt: ALT, ...SIZE },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.queryByRole('heading')).not.toBeInTheDocument()
    await expect(canvas.getByRole('img', { name: ALT })).toBeInTheDocument()
  },
}

/**
 * These sections are ONLY an image — unlike `ArchitectureSection` there is no
 * prose beside them restating the content, so the alt is the whole of what a
 * screen reader gets. It must be exposed, not empty.
 */
export const ImageCarriesItsOwnDescription: Story = {
  args: { image: IMAGE, imageAlt: ALT, ...SIZE },
  play: async ({ canvasElement }) => {
    const image = canvasElement.querySelector('img')

    await expect(image).toHaveAttribute('alt', ALT)
    await expect(image?.getAttribute('alt')).not.toBe('')
  },
}

/**
 * The container takes the asset's own ratio. A fixed one fitted these 2.73:1
 * diagrams into a 16:9 box and left roughly a third of its height blank.
 */
export const SizedFromTheAssetsOwnRatio: Story = {
  args: { image: IMAGE, imageAlt: ALT, ...SIZE },
  play: async ({ canvasElement }) => {
    const image = canvasElement.querySelector('img')

    await expect(image).toHaveAttribute('width', '2666')
    await expect(image).toHaveAttribute('height', '978')
  },
}
