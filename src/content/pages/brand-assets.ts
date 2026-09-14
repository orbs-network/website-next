/**
 * The brand-asset downloads: nine logo variants, each offered as PNG and SVG.
 *
 * These files are NOT put through `scripts/optimize-images.mjs`, unlike every
 * other image this migration has moved. They are the deliverable — a designer
 * downloads one and uses it — so they are served byte-for-byte as the brand
 * team published them.
 *
 * That is not a theoretical concern. Running the optimiser over them resized
 * `horizontal-white-logo.png` from 4580x1371 to 1800x539 and
 * `vertical-white-logo.png` from 2825x2383 to 1800x1518, because the script
 * caps width at 1800 for display imagery. Anyone downloading the horizontal
 * white logo for print would have received a quarter of the resolution the
 * brand team published.
 *
 * NOT MIGRATED: the legacy "Download all" button. It is a `<button>` with a
 * client-side zip builder behind it and no zip file anywhere in the repo —
 * interactive behaviour belonging to #33. Every asset is individually
 * downloadable without it.
 */

export type BrandAsset = {
  id: string
  /** Shown on the page; the SVG, so it stays crisp at any size. */
  preview: string
  png: string
  svg: string
}

export const BRAND_ASSETS: readonly BrandAsset[] = [
  {
    id: 'horizontal-gradient-logo',
    preview: '/marketing/brand-assets/orbs-logo-horizonal.svg',
    png: '/marketing/brand-assets/orbs-logo-horizonal.png',
    svg: '/marketing/brand-assets/orbs-logo-horizonal.svg',
  },
  {
    id: 'vertical-gradient-logo',
    preview: '/marketing/brand-assets/orbs-logo-vertical.svg',
    png: '/marketing/brand-assets/orbs-logo-vertical.png',
    svg: '/marketing/brand-assets/orbs-logo-vertical.svg',
  },
  {
    id: 'horizontal-black-logo',
    preview: '/marketing/brand-assets/orbs-logo-black.svg',
    png: '/marketing/brand-assets/orbs-logo-black.png',
    svg: '/marketing/brand-assets/orbs-logo-black.svg',
  },
  {
    id: 'vertical-black-logo',
    preview: '/marketing/brand-assets/vertical-black-logo.svg',
    png: '/marketing/brand-assets/vertical-black-logo.png',
    svg: '/marketing/brand-assets/vertical-black-logo.svg',
  },
  {
    id: 'horizontal-white-logo',
    preview: '/marketing/brand-assets/horizontal-white-logo.svg',
    png: '/marketing/brand-assets/horizontal-white-logo.png',
    svg: '/marketing/brand-assets/horizontal-white-logo.svg',
  },
  {
    id: 'vertical-white-logo',
    preview: '/marketing/brand-assets/vertical-white-logo.svg',
    png: '/marketing/brand-assets/vertical-white-logo.png',
    svg: '/marketing/brand-assets/vertical-white-logo.svg',
  },
  {
    id: 'white-logo',
    preview: '/marketing/brand-assets/white-logo.svg',
    png: '/marketing/brand-assets/white-logo.png',
    svg: '/marketing/brand-assets/white-logo.svg',
  },
  {
    id: 'gradient-logo',
    preview: '/marketing/brand-assets/gradient-logo.svg',
    png: '/marketing/brand-assets/gradient-logo.png',
    svg: '/marketing/brand-assets/gradient-logo.svg',
  },
  {
    id: 'black-logo',
    preview: '/marketing/brand-assets/black-logo.svg',
    png: '/marketing/brand-assets/black-logo.png',
    svg: '/marketing/brand-assets/black-logo.svg',
  },
]
