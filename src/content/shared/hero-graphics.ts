import type { SectionGraphic } from '@/components/marketing/section-parts'

/**
 * The page-hero illustrations, one per page, each in a dark and a light file.
 *
 * From the `Hero Illustrations` page in Figma (`2271:1682`), which Sara laid
 * out so every illustration sits beside its light twin. That page exports as
 * two flat sheets, not one file per illustration, so these were sliced from
 * the sheets by card: each card's caption and background dropped, and both
 * variants cropped to the SAME box (the union of the two), so switching theme
 * never rescales the art. The slicing was a one-off script, not kept: when the
 * art changes, ask for one SVG per illustration rather than the sheet.
 *
 * One hand edit: `dspot/hero-light.svg` had five dashed guides left `white` in
 * the export, invisible on the light theme; they are `#121214` like every
 * other light file's.
 *
 * `width`/`height` are the crop box, rounded. `ThemedGraphic` lays them out
 * `object-contain` in a square, so they only set the aspect ratio.
 *
 * Not here: the SDK illustration on the same sheet. There is no SDK page (#206).
 */
function hero(dir: string, width: number, height: number): SectionGraphic {
  return { src: `/marketing/${dir}/hero.svg`, lightSrc: `/marketing/${dir}/hero-light.svg`, width, height }
}

export const HERO_GRAPHICS = {
  institutional: hero('institutional', 535, 648),
  liquidityHub: hero('liquidity-hub', 608, 648),
  dspot: hero('dspot', 465, 648),
  dtwap: hero('dtwap', 722, 648),
  dlimit: hero('dlimit', 648, 444),
  dsltp: hero('dsltp', 648, 648),
  dperps: hero('dperps', 648, 648),
  agentic: hero('agentic', 648, 648),
  venues: hero('venues', 654, 624),
  overview: hero('overview', 651, 571),
  aiSkills: hero('ai-skills', 604, 489),
} as const satisfies Record<string, SectionGraphic>
