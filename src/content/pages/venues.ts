/**
 * Structural data for the Venues page (#157). Copy lives under `pages.venues`.
 *
 * From the `Desktop / Solutions / Venues` template frame, 2026-09-28 — the SDK
 * page's skeleton with venue-facing copy.
 *
 * The new content handoff supplies Contact and trading-documentation CTAs.
 * The earlier UI-kit pitch and frontend diagram have been replaced by the
 * SushiSwap case study.
 */

import { HERO_GRAPHICS } from '@/content/shared/hero-graphics'
import { FEATURED_INTEGRATIONS, integrationPartner } from '@/content/shared/integrations'
import type { LogoRowItem } from '@/components/marketing/logo-row'

export const VENUES_PARTNERS: readonly LogoRowItem[] = FEATURED_INTEGRATIONS.map((id) => {
  const partner = integrationPartner(id)
  return {
    name: partner.name,
    logo: partner.logo && {
      ...partner.logo,
      src: partner.logo.src.replace('-on-light.', '.'),
      onLight: partner.logo.src,
    },
    wordmark: true,
  }
})

export const VENUES_LINKS = {
  contact: '/contact',
} as const

/** Exported and themed like dSPOT's — see `DSPOT_GRAPHICS`. */
export const VENUES_GRAPHICS = {
  /** The bow-tie of order routes through one venue. */
  hero: HERO_GRAPHICS.venues,
} as const

/** The closing block's scrolling phrases, in design order. */
export const VENUES_MARQUEE = ['advancedOrders', 'liquidityRoutes', 'yourBrand'] as const
