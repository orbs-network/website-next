/**
 * Structural data for the DeFi Notifications page. Copy lives under
 * `pages.notifications` in the message catalogs.
 *
 * NOT MIGRATED: the legacy `projects/` section. Its three entries are identical
 * placeholders — all titled "AAVE Project", all reading "Lorem Upsum text here
 * about project", all pointing at `/` — and the published page does not render
 * them. Confirmed against the live site, which shows zero occurrences. Content
 * that was never finished and never shipped is not migrated.
 */

export type NotificationIntegration = {
  id: string
  name: string
  url: string
  image: string
}

/** The community integrations, in legacy order. */
export const NOTIFICATION_INTEGRATIONS: readonly NotificationIntegration[] = [
  {
    id: 'aave',
    name: 'Aave',
    url: 'https://github.com/open-defi-notification-protocol/projects/tree/master/aave',
    image: '/marketing/notifications/integrations/aave.png',
  },
  {
    id: 'compound',
    name: 'Compound',
    url: 'https://github.com/open-defi-notification-protocol/projects/tree/master/compound',
    image: '/marketing/notifications/integrations/compound.png',
  },
  {
    id: 'uniswap',
    name: 'Uniswap V2',
    url: 'https://github.com/open-defi-notification-protocol/projects/tree/master/uniswap',
    image: '/marketing/notifications/integrations/uniswap.png',
  },
  {
    id: 'sushi',
    name: 'Sushi',
    url: 'https://github.com/open-defi-notification-protocol/projects/tree/master/sushi',
    image: '/marketing/notifications/integrations/sushi.png',
  },
  {
    id: 'opensea',
    name: 'OpenSea',
    url: 'https://github.com/open-defi-notification-protocol/projects/tree/master/opensea',
    image: '/marketing/notifications/integrations/opensea.png',
  },
  {
    id: 'ethereum',
    name: 'ethereum',
    url: 'https://github.com/open-defi-notification-protocol/projects/tree/master/ethereum',
    image: '/marketing/notifications/integrations/ethereum.png',
  },
  {
    id: 'venus',
    name: 'Venus',
    url: 'https://github.com/open-defi-notification-protocol/projects/tree/master/venus',
    image: '/marketing/notifications/integrations/venus.png',
  },
  {
    id: 'pancakeswap',
    name: 'PancakeSwap',
    url: 'https://github.com/open-defi-notification-protocol/projects/tree/master/pancakeswap',
    image: '/marketing/notifications/integrations/pancakeswap.png',
  },
  {
    id: 'quickswap',
    name: 'Quickswap',
    url: 'https://github.com/open-defi-notification-protocol/projects/tree/master/quickswap',
    image: '/marketing/notifications/integrations/quickswap.png',
  },
  {
    id: 'alpaca',
    name: 'Alpaca',
    url: 'https://github.com/open-defi-notification-protocol/projects/tree/master/alpaca',
    image: '/marketing/notifications/integrations/alpaca.png',
  },
  {
    id: 'orbs',
    name: 'Orbs',
    url: 'https://github.com/open-defi-notification-protocol/projects/tree/master/orbs',
    image: '/marketing/notifications/integrations/orbs.png',
  },
  {
    id: 'harvest-finance',
    name: 'Harvest',
    url: 'https://github.com/open-defi-notification-protocol/projects/tree/master/harvest-finance',
    image: '/marketing/notifications/integrations/harvest-finance.png',
  },
  {
    id: 'pangolin',
    name: 'Pangolin',
    url: 'https://github.com/open-defi-notification-protocol/projects/tree/master/pangolin',
    image: '/marketing/notifications/integrations/pangolin.png',
  },
  {
    id: 'traderjoe',
    name: 'Trader Joe',
    url: 'https://github.com/open-defi-notification-protocol/projects/tree/master/traderjoe',
    image: '/marketing/notifications/integrations/traderjoe.png',
  },
  {
    id: 'dinoswap',
    name: 'dinoswap',
    url: 'https://github.com/open-defi-notification-protocol/projects/tree/master/dinoswap',
    image: '/marketing/notifications/integrations/dinoswap.png',
  },
  {
    id: 'kogefarm',
    name: 'KogeFarm',
    url: 'https://github.com/open-defi-notification-protocol/projects/tree/master/kogefarm',
    image: '/marketing/notifications/integrations/kogefarm.png',
  },
  {
    id: 'wowswap',
    name: 'WOWswap',
    url: 'https://github.com/open-defi-notification-protocol/projects/tree/master/wowswap',
    image: '/marketing/notifications/integrations/wowswap.png',
  },
  {
    id: 'dot-finance',
    name: 'Dot.Finance',
    url: 'https://github.com/open-defi-notification-protocol/projects/tree/master/dot-finance',
    image: '/marketing/notifications/integrations/dot-finance.png',
  },
  {
    id: 'revault',
    name: 'Revault',
    url: 'https://github.com/open-defi-notification-protocol/projects/tree/master/revault',
    image: '/marketing/notifications/integrations/revault.png',
  },
]

/** Hero, schema and the contribute example. */
export const NOTIFICATION_IMAGES = {
  hero: '/marketing/notifications/hero.png',
  schema: '/marketing/notifications/schema.png',
  example: '/marketing/notifications/example-aave.png',
} as const

/** The two app stores, from the legacy `apps` section. */
export const NOTIFICATION_APPS = {
  google: 'https://play.google.com/store/apps/details?id=com.orbs.openDefiNotificationsApp',
  apple: 'https://apps.apple.com/il/app/defi-notifications/id1588243632',
  github: 'https://github.com/open-defi-notification-protocol',
} as const
