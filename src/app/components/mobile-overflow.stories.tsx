import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect } from 'storybook/test'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MarkdownProse } from '@/components/marketing/markdown-prose'

/**
 * Nothing may be wider than a phone's content column (#189).
 *
 * This is the fourth time the class has been found, and the first three were
 * found by hand: #96 (an absolutely positioned child), #108 (a fixed-size
 * heading), and #189 (a button and a raw URL, then a tab list at 360px). Each
 * looked fine in every screenshot, because a page that scrolls sideways by a
 * few pixels looks exactly like one that does not.
 *
 * WHY STORIES AND NOT A ROUTE SWEEP. The honest guard is to load every route at
 * 360px and assert `scrollWidth <= innerWidth` — `scripts/check-overflow.mjs`
 * does exactly that, and it is how these were found. But it needs a built site,
 * a build needs Contentful credentials, and CI has neither. What CI does have
 * is this runner, and all three #189 causes were COMPONENT-level: text that
 * could not break, inside a box that would not shrink. So each is rendered
 * here inside a column the width of a phone's, and the column must not
 * overflow.
 *
 * 320px is the column on a 360px phone once the page's 20px gutters come off,
 * which is the narrowest common width and the one that caught the tab list.
 */

const COLUMN = 320

const meta = {
  title: 'Foundations/MobileOverflow',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** The column's content must fit the column. `scrollWidth` counts what spills. */
function assertFits(canvasElement: HTMLElement) {
  const column = canvasElement.querySelector('[data-testid="column"]') as HTMLElement

  expect(column.clientWidth).toBe(COLUMN)
  expect(column.scrollWidth, `content is ${column.scrollWidth}px in a ${COLUMN}px column`).toBeLessThanOrEqual(
    column.clientWidth
  )
}

function Column({ children }: { children: React.ReactNode }) {
  return (
    <div data-testid="column" style={{ width: COLUMN }}>
      {children}
    </div>
  )
}

/**
 * A button whose label does not fit on one line wraps, rather than pushing
 * the page sideways. The shadcn default is `whitespace-nowrap`, which is how
 * "Contribute your notification" became 449px of button in a 350px column.
 */
export const LongButtonLabelWraps: Story = {
  render: () => (
    <Column>
      <Button>Contribute your notification to the open protocol registry</Button>
    </Column>
  ),
  play: async ({ canvasElement }) => {
    assertFits(canvasElement)

    // And it did wrap, rather than fitting by being truncated.
    const button = canvasElement.querySelector('button') as HTMLElement
    expect(button.getBoundingClientRect().height).toBeGreaterThan(48)
  },
}

/**
 * A tab list too wide for the column scrolls inside itself — and its FIRST tab
 * stays reachable.
 *
 * Both halves matter. The list must not widen the page, which is what the
 * English dTWAP and dLIMIT labels did at 360px. And it must not solve that by
 * centring an overflowing row, which spills off both ends and puts the first
 * tab where no amount of scrolling reaches it.
 */
export const LongTabListScrollsInPlace: Story = {
  render: () => (
    <Column>
      <Tabs defaultValue="react">
        <TabsList>
          <TabsTrigger value="react">React Component</TabsTrigger>
          <TabsTrigger value="ui">Fully Customizable UI</TabsTrigger>
          <TabsTrigger value="deps">No new dependencies</TabsTrigger>
        </TabsList>
      </Tabs>
    </Column>
  ),
  play: async ({ canvasElement }) => {
    assertFits(canvasElement)

    const list = canvasElement.querySelector('[role="tablist"]') as HTMLElement
    const first = canvasElement.querySelector('[role="tab"]') as HTMLElement

    // It genuinely overflows — otherwise this story proves nothing.
    expect(list.scrollWidth).toBeGreaterThan(list.clientWidth)
    // ...and the overflow went right, where scrolling can reach it.
    expect(first.getBoundingClientRect().left).toBeGreaterThanOrEqual(list.getBoundingClientRect().left - 0.5)
  },
}

/**
 * An unbreakable run in prose — a raw URL — wraps instead of widening its
 * column, including when that column is a FLEX ITEM.
 *
 * The flex row is the point. `overflow-wrap: break-word` breaks the URL but
 * does not lower the element's min-content width, and a flex item will not
 * shrink below that — so the row still insists on the URL's width and the
 * overflow simply moves up a level. That is the white-paper abstract's layout
 * exactly: a thumbnail beside the text.
 */
export const RawUrlInProseWraps: Story = {
  render: () => (
    <Column>
      <div className="flex gap-4">
        <div className="size-16 shrink-0 bg-muted" />
        <div>
          <MarkdownProse>
            {'Published by the IEEE at https://ieeexplore.ieee.org/document/8486415. and presented in 2018.'}
          </MarkdownProse>
        </div>
      </div>
    </Column>
  ),
  play: async ({ canvasElement }) => {
    assertFits(canvasElement)
  },
}
