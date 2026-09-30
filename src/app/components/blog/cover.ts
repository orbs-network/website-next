/**
 * The frame a post's cover image sits in, wherever a post is shown as a card.
 *
 * Covers are banners made for social cards, with logos out at the edges. Most
 * of them are 2:1 (8 of 14 sampled on 09-30), and the rest are anything from
 * 0.81 to 2.52. The old 16:9 `object-cover` frame cut the ends off every one,
 * which is how "Ring", "dTWAP/dLIMIT" and "QUICKSWAP" lost letters (#223).
 *
 * So the frame is 2:1, where the usual banner fills it exactly, and the image
 * is CONTAINED on a tinted ground. An odd-shaped cover is letterboxed rather
 * than cropped. A cropped brand banner is a broken one; a letterboxed one is
 * only smaller.
 */
export const COVER_FRAME = 'aspect-[2/1] bg-surface'
export const COVER_IMAGE = 'object-contain'
