import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { BLOCKS, INLINES, type Document, type Text } from '@contentful/rich-text-types'
import { BlogRichText } from './rich-text'

const text = (value: string): Text => ({ nodeType: 'text', value, marks: [], data: {} })
const longUrl = `https://example.com/${'a-long-unbroken-article-path-'.repeat(12)}`

const document: Document = {
  nodeType: BLOCKS.DOCUMENT,
  data: {},
  content: [
    {
      nodeType: BLOCKS.PARAGRAPH,
      data: {},
      content: [
        {
          nodeType: INLINES.HYPERLINK,
          data: { uri: longUrl },
          content: [text(longUrl)],
        },
      ],
    },
    {
      nodeType: BLOCKS.TABLE,
      data: {},
      content: [
        {
          nodeType: BLOCKS.TABLE_ROW,
          data: {},
          content: ['Year', 'Monthly transactions', 'Total transactions', 'Validator performance'].map((label) => ({
            nodeType: BLOCKS.TABLE_HEADER_CELL,
            data: {},
            content: [{ nodeType: BLOCKS.PARAGRAPH, data: {}, content: [text(label)] }],
          })),
        },
        {
          nodeType: BLOCKS.TABLE_ROW,
          data: {},
          content: ['2026', '123456789012345678901234567890', '987654321098765432109876543210', '99.999999999999%'].map(
            (value) => ({
              nodeType: BLOCKS.TABLE_CELL,
              data: {},
              content: [{ nodeType: BLOCKS.PARAGRAPH, data: {}, content: [text(value)] }],
            })
          ),
        },
      ],
    },
  ],
}

const meta = {
  title: 'Blog/RichText',
  component: BlogRichText,
  args: { document },
} satisfies Meta<typeof BlogRichText>
export default meta
type Story = StoryObj<typeof meta>

export const MobileOverflow: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // A page can be wider than an embedded story. Check both so clipping the
    // story's outside wrapper cannot disguise the original overflow bug.
    for (const width of [320, 360, 390]) {
      canvasElement.style.width = `${width}px`
      const prose = canvasElement.querySelector('.prose')!
      const region = canvas.getByRole('region', { name: 'Scrollable table' })
      const table = canvas.getByRole('table')
      expect(prose.scrollWidth).toBeLessThanOrEqual(width)
      expect(region.clientWidth).toBeLessThanOrEqual(width)
      expect(table.getBoundingClientRect().width).toBeGreaterThan(region.clientWidth)
      region.scrollLeft = region.scrollWidth
      expect(region.scrollLeft).toBeGreaterThan(0)
      expect(canvas.getByRole('link')).toHaveAttribute('href', longUrl)
      expect(canvas.getAllByRole('columnheader')).toHaveLength(4)
      region.focus()
      expect(region).toHaveFocus()
    }
    canvasElement.style.removeProperty('width')
  },
}
