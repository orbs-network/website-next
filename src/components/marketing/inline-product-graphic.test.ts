import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { InlineProductGraphic } from './inline-product-graphic'

describe('inline product artwork', () => {
  it.each(['venue', 'lambda', 'vm'] as const)(
    'renders %s as responsive vectors in both themes without an image filter',
    (artwork) => {
      const html = renderToStaticMarkup(createElement(InlineProductGraphic, { artwork }))
      expect(html.match(/<svg\b/g)).toHaveLength(2)
      expect(html).toContain('data-graphic-theme="dark"')
      expect(html).toContain('data-graphic-theme="light"')
      expect(html).toContain('hidden dark:block')
      expect(html).toContain('block dark:hidden')
      expect(html.match(/class="block h-auto w-full overflow-visible"/g)).toHaveLength(2)
      expect(html).toContain('aria-hidden="true"')
      expect(html.match(/focusable="false"/g)).toHaveLength(2)
      expect(html).toContain('<feGaussianBlur')
      expect(html).toContain('<path')
      expect(html).not.toMatch(/<img\b|<image\b|<script\b|\son\w+=|drop-shadow-\[/)
      expect(html).not.toContain('undefined')
    }
  )

  it('keeps every gradient and filter reference local when graphics repeat on one page', () => {
    const html = renderToStaticMarkup(
      createElement(
        'div',
        null,
        ...(['venue', 'lambda', 'vm', 'venue'] as const).map((artwork, index) =>
          createElement(InlineProductGraphic, { artwork, key: index })
        )
      )
    )
    const ids = Array.from(html.matchAll(/\bid="([^"]+)"/g), ([, id]) => id)
    expect(new Set(ids).size).toBe(ids.length)
    const svgs = html.match(/<svg\b[\s\S]*?<\/svg>/g) ?? []
    expect(svgs).toHaveLength(8)
    for (const svg of svgs) {
      const localIds = new Set(Array.from(svg.matchAll(/\bid="([^"]+)"/g), ([, id]) => id))
      const references = Array.from(svg.matchAll(/url\(#([^)]+)\)/g), ([, id]) => id)
      expect(references.length).toBeGreaterThan(0)
      for (const id of references) expect(localIds.has(id), id).toBe(true)
    }
  })
})
