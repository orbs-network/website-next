/**
 * The frame a post's cover image sits in, wherever a post is shown as a card.
 *
 * Covers are banners made for social cards, with logos out at the edges. Of
 * the 20 newest posts, 14 covers are exactly 2:1, two are 2.52, one 1.91, one
 * 1.78, and two have none (measured 10-05). The archive behind them is mixed:
 * of 480 covers, about a third each are ~16:9, ~2:1 and wider than 2.1, with
 * a few squarer ones. The old 16:9 `object-cover` frame cut the ends off,
 * which is how "Ring", "dTWAP/dLIMIT" and "QUICKSWAP" lost letters (#223).
 *
 * So the frame is 2:1, where the current banner fills it exactly, and the
 * image is CONTAINED on a tinted ground. An odd-shaped cover is letterboxed
 * rather than cropped. A cropped brand banner is a broken one; a letterboxed
 * one is only smaller. The frame stays fixed, rather than following each
 * image, so cards in a row keep one height.
 */
export const COVER_FRAME = 'aspect-[2/1] bg-surface'
export const COVER_IMAGE = 'object-contain'

/** Shown for a post with no cover. A 16:9 gradient with the mark at its centre. */
export const COVER_PLACEHOLDER = '/blog/placeholder.png'

/**
 * The image to show in a cover frame, and how it fits.
 *
 * The placeholder is the one image whose content is known: a 2:1 crop of it
 * only trims gradient above and below the mark, so it FILLS the frame. Bars
 * around our own fallback would read as a broken image, not a careful one.
 */
export function coverImage(url: string | null): { src: string; fit: string } {
  return url ? { src: url, fit: COVER_IMAGE } : { src: COVER_PLACEHOLDER, fit: 'object-cover' }
}
