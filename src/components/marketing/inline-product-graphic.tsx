import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { useId } from 'react'

// Only these reviewed repository assets can enter the page as SVG markup.
const FILES = {
  venue: ['dperps/venue.svg', 'dperps/venue-light.svg'],
  lambda: ['execution-services/lambda-interface.svg', 'execution-services/lambda-interface-light.svg'],
  vm: ['execution-services/vm-interface.svg', 'execution-services/vm-interface-light.svg'],
} as const

const ARTWORK = Object.fromEntries(
  Object.entries(FILES).map(([key, files]) => [
    key,
    files.map((file) => readFileSync(join(process.cwd(), 'public/marketing', file), 'utf8')),
  ])
) as Record<keyof typeof FILES, string[]>

function inlineSvg(source: string, prefix: string) {
  const ids = new Map(Array.from(source.matchAll(/\bid="([^"]+)"/g), ([, id], index) => [id, `${prefix}-${index}`]))
  return source
    .replace('<svg ', '<svg focusable="false" class="block h-auto w-full overflow-visible" ')
    .replace(/\bid="([^"]+)"/g, (_, id: string) => `id="${ids.get(id)}"`)
    .replace(/url\(#([^)]+)\)/g, (_, id: string) => `url(#${ids.get(id)})`)
}

/**
 * Safari can rasterise filters in SVG image documents at 1x on Retina screens
 * (WebKit #325131). Inline vectors use the page's device scale instead.
 *
 * The SVG's own shadow can overflow its viewport here. Applying a CSS filter
 * to this wrapper would flatten the foreground again; keep it unfiltered.
 */
export function InlineProductGraphic({ artwork }: { artwork: keyof typeof FILES }) {
  const id = useId().replace(/:/g, '')
  const [dark, light] = ARTWORK[artwork]
  return (
    <span aria-hidden="true" data-product-graphic={artwork} className="block w-full">
      <span
        className="hidden dark:block"
        data-graphic-theme="dark"
        dangerouslySetInnerHTML={{ __html: inlineSvg(dark, `${id}-dark`) }}
      />
      <span
        className="block dark:hidden"
        data-graphic-theme="light"
        dangerouslySetInnerHTML={{ __html: inlineSvg(light, `${id}-light`) }}
      />
    </span>
  )
}
