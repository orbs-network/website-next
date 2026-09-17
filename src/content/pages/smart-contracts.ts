/**
 * Structural data for the Smart Contracts page. Copy lives under
 * `pages.smartContracts`.
 *
 * The page lists the Orbs PoS contracts deployed on Ethereum, each with a
 * summary, an expandable detail, and a link to the contract on a block
 * explorer.
 *
 * ADDRESSES ARE STORED HERE, NOT IN THE CATALOGS, and that is the point of this
 * file. An Ethereum address is chain data: it does not change when the page is
 * read in Japanese. The legacy site embedded each address inside a markdown
 * link in the prose, once per locale — 45 copies of 15 addresses, maintained by
 * translators. It had already drifted: the Japanese copy of the subscription
 * plan entry dropped its link entirely, so a Japanese reader got no way to
 * reach the contract at all. Storing them once means a locale cannot disagree
 * with the chain, and a translator never has to handle a hex string.
 */

/** The block explorer every contract link points at. */
const EXPLORER = 'https://etherscan.io/address/'

/**
 * A deployed contract, in the order the legacy page lists them.
 *
 * `addresses` is a list because two entries cover a pair of contracts — the
 * protocol wallets and the fees wallets are each described as one concept with
 * two deployments, which is how the legacy page presents them.
 */
export type OrbsContract = {
  /** Catalog key under `pages.smartContracts.contracts`. */
  id: string
  addresses: readonly string[]
}

export const ORBS_CONTRACTS: readonly OrbsContract[] = [
  { id: 'item1', addresses: ['0xD859701C81119aB12A1e62AF6270aD2AE05c7AB3'] },
  { id: 'item2', addresses: ['0x01d59af68e2dcb44e04c50e05f62e7043f2656c3'] },
  { id: 'item3', addresses: ['0x77A4e01C20d4a67372f300297fB69Da981c19755'] },
  { id: 'item4', addresses: ['0xB97178870F39d4389210086E4BcaccACD715c71d'] },
  { id: 'item5', addresses: ['0x02Ca9F2c5dD0635516241efD480091870277865b'] },
  { id: 'item6', addresses: ['0x1a4c7891d2d04b2cd413b98bc3283c8d992f5fa7'] },
  { id: 'item7', addresses: ['0xB5303c22396333D9D27Dc45bDcC8E7Fc502b4B32'] },
  { id: 'item8', addresses: ['0xda7e381544Fc73cad7D9E63C86e561452b9B9E9C'] },
  // Protocol wallets: stakingRewardsWallet and bootstrapRewardsWallet.
  {
    id: 'item9',
    addresses: ['0xdBb374E965B21C5d6EE370dcB80176884Fa936f1', '0x60f99fe905c714a1eb1d50e7dfb91c9f956478e0'],
  },
  // Fees wallets. The legacy copy describes two deployments — one general, one
  // certified — but links only one. Reproduced as published rather than
  // inventing the second address.
  { id: 'item10', addresses: ['0x1ef2ec57f23dcb4d3696ced6d70c60a8722ddf92'] },
  { id: 'item11', addresses: ['0xce97f8c79228c53b8b9ad86800a493d1e7e5d1e3'] },
  { id: 'item12', addresses: ['0x8d2a2a4dbdf9c9d9dff72abc96a2751b70ab3011'] },
  { id: 'item13', addresses: ['0xD11EFC10cf3A54B12e3F04143070BE3865E7Bb8E'] },
  // NOTE: the same address as `item13`, carried over from the legacy content.
  // `subscriptions` and `Subscription plan` are described as distinct
  // contracts, so one of the two links is probably wrong — but which one cannot
  // be settled from the website repo, and guessing an address is worse than
  // reproducing the published one. See #169.
  { id: 'item14', addresses: ['0xD11EFC10cf3A54B12e3F04143070BE3865E7Bb8E'] },
  { id: 'item15', addresses: ['0xeda03aDAbD68Da5B01326575712F01029d99703a'] },
] as const

/**
 * The five administrative roles, in legacy order.
 *
 * Marks come from `assets/img/smart-contracts/`. The legacy file names are not
 * reproduced: `003-cancel.svg` was the third box's image, a name left over from
 * an icon pack, and carrying it forward would leave the next reader wondering
 * what cancelling has to do with the migration manager.
 */
export const CONTRACT_ROLES = ['role1', 'role2', 'role3', 'role4', 'role5'] as const

/** The explorer URL for a contract address. */
export function explorerUrl(address: string): string {
  return `${EXPLORER}${address}`
}

/**
 * A short form of an address, for display.
 *
 * The full 42 characters overflow a phone viewport and carry no meaning at a
 * glance; the link's accessible name says where it goes, and the full address
 * is one click away on the explorer.
 */
export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}
