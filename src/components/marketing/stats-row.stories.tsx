import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { StatsRow } from './stats-row'

const meta = {
  title: 'Marketing/StatsRow',
  component: StatsRow,
} satisfies Meta<typeof StatsRow>

export default meta
type Story = StoryObj<typeof meta>

const STATS = [
  { id: 'volume', value: '$14B+', label: 'Cumulative volume' },
  { id: 'chains', value: '10+', label: 'Chains live' },
]

/**
 * A description list, not a grid of divs: each label is the term and each
 * figure its value, so a screen reader announces "Cumulative volume, $14B+"
 * rather than two loose strings whose relationship is only visual.
 */
export const IsADescriptionList: Story = {
  args: { stats: STATS, locale: 'en' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvasElement.querySelectorAll('dt')).toHaveLength(2)
    await expect(canvasElement.querySelectorAll('dd')).toHaveLength(2)
    await expect(canvas.getByText('$14B+')).toBeInTheDocument()
    await expect(canvas.getByText('Cumulative volume')).toBeInTheDocument()
    for (const element of canvasElement.querySelectorAll('dt, dd')) {
      await expect(getComputedStyle(element).textAlign).toBe('center')
    }
  },
}

/**
 * The figure shows above its label but is the `<dd>`: `flex-col-reverse` gives
 * the design's emphasis without inverting the reading order in the markup.
 */
export const LabelPrecedesValueInTheMarkup: Story = {
  args: { stats: STATS, locale: 'en' },
  play: async ({ canvasElement }) => {
    const first = canvasElement.querySelector('dl > div')

    await expect(first?.firstElementChild?.tagName).toBe('DT')
    await expect(first?.lastElementChild?.tagName).toBe('DD')
  },
}

/** The title is optional — the institutional page runs these bare. */
export const TitleIsOptional: Story = {
  args: { stats: STATS, locale: 'en' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('heading')).not.toBeInTheDocument()
  },
}

const PHONE = {
  parameters: {
    viewport: { options: { phone390: { name: 'Phone 390', styles: { width: '390px', height: '844px' } } } },
  },
  globals: { viewport: { value: 'phone390' } },
}

/**
 * The home row: figures centred in their columns, under a glow that is
 * centred too, and the glow reaching past the outer figures does not scroll
 * the page sideways. It did, by 20px at 390, before the section clipped it —
 * an invisible pseudo-element still counts as overflow.
 */
export const CentredGlowDoesNotOverflow: Story = {
  ...PHONE,
  args: { stats: STATS, columns: 5, glow: true, locale: 'en' },
  play: async ({ canvasElement }) => {
    const dl = canvasElement.querySelector('dl')!
    await expect(getComputedStyle(dl).textAlign).toBe('center')
    const cells = [...dl.children].map((node) => node.getBoundingClientRect())
    await expect(cells[0].top).toBe(cells[1].top)
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth)
  },
}

const FIVE_STATS = [
  { id: 'volume', value: '$14B+', label: 'Processed' },
  { id: 'launch', value: '2017', label: 'Project live' },
  { id: 'venues', value: '30+', label: 'Venues' },
  { id: 'chains', value: '10+', label: 'Chains' },
  { id: 'staked', value: '1.1B', label: 'ORBS staked' },
]

export const LastMobileStatIsCentred: Story = {
  ...PHONE,
  args: { stats: FIVE_STATS, columns: 5, glow: true, locale: 'en' },
  play: async ({ canvasElement }) => {
    const grid = canvasElement.querySelector('dl')!
    const cells = [...grid.children].map((node) => node.getBoundingClientRect())
    const bounds = grid.getBoundingClientRect()
    // The first four stay two per row; the odd final stat uses the whole row.
    await expect(cells[0].top).toBe(cells[1].top)
    await expect(cells[2].top).toBe(cells[3].top)
    await expect(cells[4].top).toBeGreaterThan(cells[3].bottom)
    await expect(Math.abs(cells[4].width - bounds.width)).toBeLessThan(1)
    const number = within(canvasElement).getByText('1.1B')
    await expect(getComputedStyle(number).textAlign).toBe('center')
    const value = number.getBoundingClientRect()
    await expect(Math.abs(value.left + value.width / 2 - (bounds.left + bounds.width / 2))).toBeLessThan(1)
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth)
  },
}

export const FiveDesktopStatsStayOnOneRow: Story = {
  parameters: {
    viewport: { options: { desktop: { name: 'Desktop', styles: { width: '1440px', height: '900px' } } } },
  },
  globals: { viewport: { value: 'desktop' } },
  args: { stats: FIVE_STATS, columns: 5, locale: 'en' },
  play: async ({ canvasElement }) => {
    const cells = [...canvasElement.querySelector('dl')!.children].map((node) => node.getBoundingClientRect())
    await expect(new Set(cells.map((cell) => cell.top)).size).toBe(1)
    for (const cell of cells) await expect(Math.abs(cell.width - cells[0].width)).toBeLessThan(1)
  },
}

export const TabletKeepsThreeColumns: Story = {
  parameters: {
    viewport: { options: { tablet: { name: 'Tablet', styles: { width: '768px', height: '900px' } } } },
  },
  globals: { viewport: { value: 'tablet' } },
  args: { stats: FIVE_STATS, columns: 5, locale: 'en' },
  play: async ({ canvasElement }) => {
    const cells = [...canvasElement.querySelector('dl')!.children].map((node) => node.getBoundingClientRect())
    await expect(new Set(cells.slice(0, 3).map((cell) => cell.top)).size).toBe(1)
    await expect(cells[3].top).toBe(cells[4].top)
    await expect(Math.abs(cells[4].width - cells[0].width)).toBeLessThan(1)
  },
}
