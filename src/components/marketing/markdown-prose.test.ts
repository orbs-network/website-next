import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { MarkdownProse } from './markdown-prose'

describe('prose link markers', () => {
  it.each([undefined, 'ko'] as const)('marks off-site web links with decorative icons (locale: %s)', (locale) => {
    const html = renderToStaticMarkup(MarkdownProse({ children: '[Documentation](https://docs.orbs.com/)', locale }))
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noopener noreferrer"')
    expect(html).toContain('<svg')
    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('Documentation')
  })

  it.each(['/contact', 'mailto:hello@orbs.com', 'hello@orbs.com'])(
    'leaves internal and email links unmarked: %s',
    (href) => {
      const html = renderToStaticMarkup(MarkdownProse({ children: `[Contact](${href})` }))
      expect(html).not.toContain('<svg')
      expect(html).not.toContain('target="_blank"')
      expect(html).toContain(`href="${href.startsWith('/') ? '/contact/' : 'mailto:hello@orbs.com'}"`)
    }
  )
})
