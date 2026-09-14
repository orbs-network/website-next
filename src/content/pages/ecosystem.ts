/**
 * The Orbs ecosystem directory: 15 categories of projects, each with a logo and
 * a link.
 *
 * Ported from the legacy `assets/datasets/ecosystem.json`, which #37 lists as a
 * Phase 4 decision — repo or Contentful. Kept in the repo as typed data, for
 * the same reason the white papers and the FAQ are: it is 175 entries that
 * change when a partner is added, which is rare, and everything else this
 * migration has moved went the same way. If partner churn ever justifies an
 * editor, this is a small module to replace.
 *
 * Names and URLs are proper nouns, so there is no locale variant — the legacy
 * `jp/` and `ko/` ecosystem directories hold the English titles verbatim.
 */

export type EcosystemEntry = {
  name: string
  url: string
  /** Absent for one entry: the legacy dataset has no logo for ANTirex. */
  logo?: string
}

export type EcosystemCategory = {
  /** Catalog key for the category's title. */
  key: string
  entries: readonly EcosystemEntry[]
}

export const ECOSYSTEM_CATEGORIES: readonly EcosystemCategory[] = [
  {
    key: 'useCases',
    entries: [
      { name: 'dTWAP', url: 'https://www.orbs.com/Introducing-TWAP-for-DEXs/', logo: '/ecosystem/useCases/dtwap.svg' },
      {
        name: 'TON Minter',
        url: 'https://www.orbs.com/Announcing-TON-Minter-by-Orbs/',
        logo: '/ecosystem/useCases/minter.svg',
      },
      {
        name: 'TON Verifier',
        url: 'https://www.orbs.com/Announcing-TON-Verifier-by-Orbs/',
        logo: '/ecosystem/useCases/verifier.svg',
      },
      {
        name: 'The Open DeFi Notifications Protocol',
        url: 'https://www.orbs.com/Introducing-Open-DeFi-Notification-Protocol/',
        logo: '/ecosystem/useCases/defi-notifications.png',
      },
      { name: 'TON Access', url: 'https://www.orbs.com/ton-access', logo: '/ecosystem/useCases/ton-access.svg' },
      {
        name: 'TON.vote',
        url: 'https://www.orbs.com/Orbs-Introduces-TON-vote/',
        logo: '/ecosystem/useCases/ton-vote.svg',
      },
      {
        name: 'TON Unfreezer',
        url: 'https://www.orbs.com/Introducing-TON-Unfreezer-by-Orbs/',
        logo: '/ecosystem/useCases/ton-unfreezer.png',
      },
      {
        name: 'dLIMIT',
        url: 'https://www.orbs.com/Introducing-dLIMIT-for-DEXs/',
        logo: '/ecosystem/useCases/dlimit.svg',
      },
      {
        name: 'liquidity hub',
        url: 'https://www.orbs.com/Liquidity-Hub-by-Orbs-The-New-Standard-for-DEXs/',
        logo: '/ecosystem/useCases/lh.jpeg',
      },
      {
        name: 'TON Single-nominator',
        url: 'https://www.orbs.com/Orbs-contributes-Single-Nominator-Smart-Contract-for-TON-Validators/',
        logo: '/ecosystem/useCases/validators.png',
      },
    ],
  },
  {
    key: 'exchanges',
    entries: [
      {
        name: 'Bybit',
        url: 'https://twitter.com/bybit_official/status/1712761532545671263?s=46&t=o0ig3dww39wpWm1ceBHBEA',
        logo: '/ecosystem/exchanges/bybit.svg',
      },
      {
        name: 'Upbit',
        url: 'https://upbit.com/exchange?code=CRIX.UPBIT.KRW-ORBS',
        logo: '/ecosystem/exchanges/upbit.svg',
      },
      {
        name: 'Bittrex',
        url: 'https://www.orbs.com/bittrex-international-lists-orbs/',
        logo: '/ecosystem/exchanges/bittrex.svg',
      },
      {
        name: 'Bithumb',
        url: 'https://twitter.com/orbs_network/status/1118771140326039552?lang=eu',
        logo: '/ecosystem/exchanges/bithumb.png',
      },
      {
        name: 'KuCoin',
        url: 'https://trade.kucoin.com/spot/ORBS-USDT?lang=en_US',
        logo: '/ecosystem/exchanges/kucoin.svg',
      },
      { name: 'Okex', url: 'https://www.okex.com/markets/spot-info/orbs-usdt', logo: '/ecosystem/exchanges/okex.svg' },
      { name: 'Gate.io', url: 'https://www.gate.io/trade/ORBS_USDT', logo: '/ecosystem/exchanges/gateio.svg' },
      {
        name: 'Huobi',
        url: 'https://www.orbs.com/Huobi-Global-Lists-Orbs-Token/',
        logo: '/ecosystem/exchanges/huobi.svg',
      },
      {
        name: 'LBank',
        url: 'https://twitter.com/lbank_exchange/status/1714148331742801943?s=46&t=o0ig3dww39wpWm1ceBHBEA',
        logo: '/ecosystem/exchanges/lbank.png',
      },
      {
        name: 'Bitmex',
        url: 'https://twitter.com/bitmex/status/1714106813870686566?s=46&t=o0ig3dww39wpWm1ceBHBEA',
        logo: '/ecosystem/exchanges/bitmex.png',
      },
      {
        name: 'Coinone',
        url: 'https://coinone.co.kr/exchange/trade/orbs/krw',
        logo: '/ecosystem/exchanges/coinone.svg',
      },
      { name: 'LaToken', url: 'https://latoken.com/exchange/ORBS_USDT', logo: '/ecosystem/exchanges/latoken.svg' },
      {
        name: 'Coinsbit',
        url: 'https://coinsbit.io/trade_classic/ORBS_ETH',
        logo: '/ecosystem/exchanges/coinsbit.svg',
      },
      { name: 'Indodax', url: 'https://indodax.com/market/ORBSIDR', logo: '/ecosystem/exchanges/Indodax.png' },
      { name: 'P2PB2b', url: 'https://p2pb2b.io/trade/ORBS_USDT/', logo: '/ecosystem/exchanges/p2p.svg' },
      {
        name: 'Bibox',
        url: 'https://www.bibox.com/en/exchange/basic/ORBS_USDT',
        logo: '/ecosystem/exchanges/bibox.svg',
      },
      {
        name: 'Bitbns',
        url: 'https://www.orbs.com/bitbns-exchange-lists-orbs-token-orbs/',
        logo: '/ecosystem/exchanges/bitbns.svg',
      },
      { name: 'ZT Global', url: 'https://www.ztb.im/exchange?coin=ORBS_USDT', logo: '/ecosystem/exchanges/zt.svg' },
      {
        name: 'Phemex',
        url: 'https://www.orbs.com/Phemex-Exchange-Lists-the-Orbs-Token/',
        logo: '/ecosystem/exchanges/phemex.svg',
      },
      {
        name: 'Bitrue',
        url: 'https://www.orbs.com/bitrue-listing-announcement/',
        logo: '/ecosystem/exchanges/bitrue.png',
      },
      { name: 'StealthEX', url: 'https://stealthex.io/?to=orbs', logo: '/ecosystem/exchanges/stealth.png' },
      { name: 'changeNOW', url: 'https://changenow.io/', logo: '/ecosystem/exchanges/changeNOW.webp' },
      { name: 'SimpleSwap', url: 'https://simpleswap.io/', logo: '/ecosystem/exchanges/simpleswap.png' },
      { name: 'GOPAX', url: 'https://www.gopax.co.kr/exchange/orbs-krw', logo: '/ecosystem/exchanges/gopax.svg' },
      {
        name: 'Tapbit',
        url: 'https://tapbitex.zendesk.com/hc/en-us/articles/24138078888729',
        logo: '/ecosystem/exchanges/tapbit.png',
      },
      {
        name: 'HyperliquidX',
        url: 'https://twitter.com/HyperliquidX/status/1713730456850419778',
        logo: '/ecosystem/exchanges/hyperliquid.svg',
      },
      {
        name: 'Mexc',
        url: 'https://www.mexc.com/support/articles/17827791511026',
        logo: '/ecosystem/exchanges/mexc.png',
      },
      {
        name: 'BingX',
        url: 'https://twitter.com/bingxofficial/status/1713248061957300256?s=46&t=o0ig3dww39wpWm1ceBHBEA',
        logo: '/ecosystem/exchanges/bingx.webp',
      },
      {
        name: 'Bitget',
        url: 'https://www.bitget.com/support/articles/12560603798912',
        logo: '/ecosystem/exchanges/bitget.png',
      },
      {
        name: 'KoinBX',
        url: 'https://twitter.com/koinbx/status/1718968533978063170?s=51&t=nQksDhcFwxUGfp97z_tr-g',
        logo: '/ecosystem/exchanges/KoinBX.svg',
      },
      {
        name: 'WhiteBit',
        url: 'https://whitebit.com/trade/ORBS-USDT?utm_source=Twitter&utm_medium=social&utm_campaign=orbs_usdt&utm_content=en&tab=open-orders',
        logo: '/ecosystem/exchanges/WhiteBit.png',
      },
      {
        name: 'WOO X',
        url: 'https://twitter.com/_woo_x/status/1717086104288166147?s=51&t=nQksDhcFwxUGfp97z_tr-g',
        logo: '/ecosystem/exchanges/woox.webp',
      },
      {
        name: 'OrangeX',
        url: 'https://twitter.com/orangexexchange/status/1714521699084087392?s=51&t=nQksDhcFwxUGfp97z_tr-g',
        logo: '/ecosystem/exchanges/orangex.png',
      },
      {
        name: 'ZKE Exchange',
        url: 'https://twitter.com/zke_com/status/1714484606689481108?s=51&t=nQksDhcFwxUGfp97z_tr-g',
        logo: '/ecosystem/exchanges/zke.webp',
      },
      {
        name: 'Blofin Exchange',
        url: 'https://twitter.com/blofin_official/status/1714120464153661470?s=51&t=nQksDhcFwxUGfp97z_tr-g',
        logo: '/ecosystem/exchanges/blofin.webp',
      },
      {
        name: 'SuperEx',
        url: 'https://twitter.com/superexet/status/1714248014783803538?s=51&t=nQksDhcFwxUGfp97z_tr-g',
        logo: '/ecosystem/exchanges/superex.png',
      },
      {
        name: 'CoinEx',
        url: 'https://twitter.com/coinexcom/status/1714458093407674611?s=46&t=o0ig3dww39wpWm1ceBHBEA',
        logo: '/ecosystem/exchanges/coinex.svg',
      },
      {
        name: 'XT.com',
        url: 'https://twitter.com/XTexchange/status/1714530461605597355?s=20',
        logo: '/ecosystem/exchanges/xt.png',
      },
      {
        name: 'BTCEX',
        url: 'https://twitter.com/BTCEX_exchange/status/1669314623256895488?s=20',
        logo: '/ecosystem/exchanges/btcex.jpg',
      },
      {
        name: 'CoinW',
        url: 'https://twitter.com/CoinWOfficial/status/1714932394225283456?s=20',
        logo: '/ecosystem/exchanges/coinw.png',
      },
      { name: 'ANTirex', url: 'https://t.me/atnirex_official/956' },
      { name: 'CoinDCX', url: 'https://www.orbs.com/CoinDCX-Lists-ORBS/', logo: '/ecosystem/exchanges/CoinDCX.svg' },
      { name: 'Ultorex', url: 'https://ultorex.io/orbs-top-10', logo: '/ecosystem/exchanges/ultorex.jpg' },
    ],
  },
  {
    key: 'transparencyAndData',
    entries: [
      {
        name: 'Xangle',
        url: 'https://xangle.io/project/ORBS/key-info',
        logo: '/ecosystem/transparencyAndData/xangle.svg',
      },
      { name: 'Messari', url: 'https://messari.io/asset/orbs', logo: '/ecosystem/transparencyAndData/messari.svg' },
      {
        name: 'Flipsidecrypto',
        url: 'https://orbs.flipsidecrypto.com/',
        logo: '/ecosystem/transparencyAndData/flipside.svg',
      },
      {
        name: 'Start-up Nation Central',
        url: 'https://finder.startupnationcentral.org/company_page/orbs',
        logo: '/ecosystem/transparencyAndData/startup.svg',
      },
      {
        name: 'Staking Rewards',
        url: 'https://www.stakingrewards.com/earn/orbs',
        logo: '/ecosystem/transparencyAndData/rewards.svg',
      },
      {
        name: 'CoinGecko',
        url: 'https://www.coingecko.com/en/coins/orbs',
        logo: '/ecosystem/transparencyAndData/coingeko.svg',
      },
      {
        name: 'CoinMarketCap',
        url: 'https://coinmarketcap.com/currencies/orbs/',
        logo: '/ecosystem/transparencyAndData/coinmarketcap.svg',
      },
      {
        name: 'TokenInsight',
        url: 'https://tokeninsight.com/tokenDetail/orbs-network(orbs)?cid=19502',
        logo: '/ecosystem/transparencyAndData/tokeninsight.svg',
      },
      { name: 'ENS', url: 'https://ens.domains/', logo: '/ecosystem/transparencyAndData/ens.svg' },
      { name: 'TheGraph', url: 'https://thegraph.com/', logo: '/ecosystem/transparencyAndData/thegraph.png' },
      { name: 'EVAI', url: 'https://evai.io/', logo: '/ecosystem/transparencyAndData/evai.svg' },
      {
        name: 'Moonlight',
        url: 'https://bubbles.moonlighttoken.com/token/0xebd49b26169e1b52c04cfd19fcf289405df55f80',
        logo: '/ecosystem/transparencyAndData/moonlight.svg',
      },
      {
        name: 'crypto.com',
        url: 'https://crypto.com/price/orbs?utm_medium=widget&utm_campaign=CoinBlocksModern&utm_source=analytics.orbs.network&utm_id=orbs',
        logo: '/ecosystem/transparencyAndData/cryptocom.svg',
      },
      { name: 'delta', url: 'https://delta.app/en/crypto/orbs/orbs', logo: '/ecosystem/transparencyAndData/delta.svg' },
      {
        name: 'CryptoRunner',
        url: 'https://cryptorunner.com/currencies/ORBS/orbs/USD/',
        logo: '/ecosystem/transparencyAndData/cryptorunner.svg',
      },
      {
        name: 'Stack',
        url: 'https://www.orbs.com/Orbs-is-added-to-Stack-Analytics/',
        logo: '/ecosystem/transparencyAndData/stack.png',
      },
      {
        name: 'Cryptocompare',
        url: 'https://www.cryptocompare.com/coins/orbs/overview',
        logo: '/ecosystem/transparencyAndData/crypto-compare.png',
      },
      {
        name: 'ico holder',
        url: 'https://icoholder.com/en/orbs-22232',
        logo: '/ecosystem/transparencyAndData/ico-holder.png',
      },
      {
        name: 'Alphaday',
        url: 'https://www.orbs.com/Alphaday-integrates-Orbs',
        logo: '/ecosystem/transparencyAndData/alphaday.png',
      },
      {
        name: 'Coinhippo',
        url: 'https://www.orbs.com/ORBS-added-to-Coinhippo/',
        logo: '/ecosystem/transparencyAndData/coinhippo.png',
      },
      { name: 'IQ.wiki', url: 'https://iq.wiki/wiki/orbs', logo: '/ecosystem/transparencyAndData/iqwiki.png' },
      {
        name: 'Coindar',
        url: 'https://www.orbs.com/Orbs-has-been-added-to-Coindar/',
        logo: '/ecosystem/transparencyAndData/coindar.webp',
      },
      {
        name: 'iq-gpt',
        url: 'https://www.orbs.com/Orbs-integrates-with-IQ-GPT/',
        logo: '/ecosystem/transparencyAndData/iq-gpt.svg',
      },
    ],
  },
  {
    key: 'socialImpact',
    entries: [
      { name: 'Hexa Foundation', url: 'https://www.hexa.org/', logo: '/ecosystem/socialImpact/hexa.svg' },
      { name: 'Yozma Group', url: '', logo: '/ecosystem/socialImpact/yozma.svg' },
    ],
  },
  {
    key: 'nft',
    entries: [{ name: 'myNFT.fyi', url: '', logo: '/ecosystem/nft/mynft.svg' }],
  },
  {
    key: 'chains',
    entries: [
      { name: 'Ethereum', url: 'https://ethereum.org/en/', logo: '/ecosystem/chains/ethereum.svg' },
      { name: 'BSC', url: 'https://www.binance.org/en/smartChain', logo: '/ecosystem/chains/binance.svg' },
      { name: 'Polygon', url: 'https://polygon.technology/', logo: '/ecosystem/chains/polygon.svg' },
      { name: 'Solana', url: 'https://solana.com/', logo: '/ecosystem/chains/solana.svg' },
      { name: 'avalance', url: 'https://www.avax.network/', logo: '/ecosystem/chains/avalanche.svg' },
      { name: 'Harmony', url: 'https://www.orbs.com/Harmony/', logo: '/ecosystem/chains/harmony.svg' },
      { name: 'FTM', url: 'https://www.orbs.com/Fantom/', logo: '/ecosystem/chains/fantom.svg' },
      {
        name: 'Cronos',
        url: 'https://www.orbs.com/Orbs-Ecosystem-Expands-to-Cronos/',
        logo: '/ecosystem/chains/cronos.png',
      },
      { name: 'TON', url: 'https://ton.org/', logo: '/ecosystem/chains/ton.svg' },
      {
        name: 'Arbitrum',
        url: 'https://www.orbs.com/orbs-expands-to-arbitrum-via-satellite-bridge-by-axelar/',
        logo: '/ecosystem/chains/arbitrum.svg',
      },
      {
        name: 'KAVA',
        url: 'https://www.orbs.com/ORBS-Expands-to-Kava-via-Satellite-Bridge-by-Axelar/',
        logo: '/ecosystem/chains/kava.svg',
      },
    ],
  },
  {
    key: 'cloud',
    entries: [
      {
        name: 'AWS',
        url: 'https://docs.orbs.network/contract-sdk/gamma-in-depth/deploying-gamma-in-the-cloud/amazon-web-services',
        logo: '/ecosystem/cloud/aws.svg',
      },
      {
        name: 'Google Cloud',
        url: 'https://docs.orbs.network/contract-sdk/gamma-in-depth/deploying-gamma-in-the-cloud/google-cloud-platform',
        logo: '/ecosystem/cloud/google.svg',
      },
      {
        name: 'MS Azure',
        url: 'https://docs.orbs.network/contract-sdk/gamma-in-depth/deploying-gamma-in-the-cloud/azure',
        logo: '/ecosystem/cloud/azure.svg',
      },
    ],
  },
  {
    key: 'explorers',
    entries: [
      { name: 'Prism', url: 'https://prism.orbs.network/', logo: '/ecosystem/explorers/prism.svg' },
      { name: 'tokenview', url: 'https://tokenview.com/en/', logo: '/ecosystem/explorers/tokenview.svg' },
      {
        name: 'Ethplorer',
        url: 'https://ethplorer.io/address/0xff56cc6b1e6ded347aa0b7676c85ab0b3d08b0fa#chart=candlestick',
        logo: '/ecosystem/explorers/ethplorer.svg',
      },
      { name: 'BscScan', url: 'https://bscscan.com/', logo: '/ecosystem/explorers/bscan.svg' },
      {
        name: 'AvaScan',
        url: 'https://www.orbs.com/ORBS-is-now-live-on-AvaScan/',
        logo: '/ecosystem/explorers/avascan.svg',
      },
      { name: 'FTMScan', url: 'https://www.orbs.com/FTMScan/', logo: '/ecosystem/explorers/ftmscan.svg' },
      { name: 'TONscan', url: 'https://tonscan.org/', logo: '/ecosystem/explorers/tonscan.svg' },
    ],
  },
  {
    key: 'oracles',
    entries: [
      {
        name: 'ChainLink',
        url: 'https://www.orbs.com/orbs-sponsors-chainlinks-price-data-feed/',
        logo: '/ecosystem/oracles/chainlink.svg',
      },
    ],
  },
  {
    key: 'partnerships',
    entries: [
      { name: 'GBBC', url: 'https://gbbcouncil.org/', logo: '/ecosystem/partnerships/gbbc.svg' },
      { name: 'WEF', url: 'https://www.weforum.org/organizations/orbs-group', logo: '/ecosystem/partnerships/wef.svg' },
      { name: 'CBAN', url: 'https://www.orbs.com/orbs-and-cban/', logo: '/ecosystem/partnerships/cban.svg' },
      {
        name: 'Paradigm',
        url: 'https://www.orbs.com/grant-approved-paradigm-fund/',
        logo: '/ecosystem/partnerships/paradigm.svg',
      },
      {
        name: 'Yes24',
        url: 'https://www.orbs.com/sey-chain-yes24-partnership/',
        logo: '/ecosystem/partnerships/yes.svg',
      },
      {
        name: 'dappradar',
        url: 'https://medium.com/@defiorg/defi-org-dappradar-launch-100k-developers-grant-for-the-open-defi-notification-protocol-c584afacea62',
        logo: '/ecosystem/partnerships/dapp-radar.png',
      },
      { name: 'TON Society', url: 'https://society.ton.org/', logo: '/ecosystem/partnerships/ton-society.png' },
      { name: 'Ozys', url: 'https://ozys.io/', logo: '/ecosystem/partnerships/ozys.png' },
      {
        name: 'DWF',
        url: 'https://www.orbs.com/DWF-invests-in-Orbs-Ecosystem/',
        logo: '/ecosystem/partnerships/dwf-labs.png',
      },
      { name: 'Scalably', url: 'https://scalably.com/en', logo: '/ecosystem/partnerships/scalably.png' },
      {
        name: 'Samsung blockchain',
        url: 'https://www.samsung.com/global/galaxy/apps/samsung-blockchain/',
        logo: '/ecosystem/partnerships/samsung.svg',
      },
    ],
  },
  {
    key: 'staking',
    entries: [
      { name: 'Citadel.one', url: 'https://citadel.one/', logo: '/ecosystem/staking/citadel.svg' },
      {
        name: 'Bitgo',
        url: 'https://www.orbs.com/celsius-bitgo-staked-join-orbs-universe/',
        logo: '/ecosystem/staking/bitgo.svg',
      },
      { name: 'Moonstake', url: 'https://wallet.moonstake.io/', logo: '/ecosystem/staking/moonstake.svg' },
      {
        name: 'Bithumb',
        url: 'https://www.orbs.com/bithumb-announces-orbs-staking/',
        logo: '/ecosystem/staking/bithumb.svg',
      },
      {
        name: 'CrossStake',
        url: 'https://www.orbs.com/Orbs-Guardian-Spotlight-Tbonestaking-by-CROSSTECH/',
        logo: '/ecosystem/staking/crosstech.jpg',
      },
      { name: 'OKX', url: 'https://www.orbs.com/OKX-Announces-ORBS-Staking/', logo: '/ecosystem/staking/okx.png' },
    ],
  },
  {
    key: 'wallets',
    entries: [
      {
        name: 'Tetra',
        url: 'https://www.orbs.com/tetra-orbs-staking-wallet-tutorial/',
        logo: '/ecosystem/wallets/tetra.png',
      },
      {
        name: 'Metamask',
        url: 'https://www.orbs.com/orbs-swaps-and-staking-now-available-on-metamask-wallet/',
        logo: '/ecosystem/wallets/metamask.svg',
      },
      { name: 'Ledger', url: '', logo: '/ecosystem/wallets/ledger.svg' },
      {
        name: 'Coinbase Wallet',
        url: 'https://www.orbs.com/orbs-staking-is-now-available-on-the-coinbase-wallet-mobile-app/',
        logo: '/ecosystem/wallets/coinbase.svg',
      },
      {
        name: 'Trust Wallet',
        url: 'https://www.orbs.com/orbs-staking-is-now-available-on-the-trust-wallet-mobile/',
        logo: '/ecosystem/wallets/trust.svg',
      },
      {
        name: 'EnjIn Wallet',
        url: 'https://www.orbs.com/tetra-staking-wallet-by-orbs-now-on-mobile/',
        logo: '/ecosystem/wallets/enjin.svg',
      },
      {
        name: 'MEW',
        url: 'https://www.orbs.com/orbs-staking-is-now-available-on-myetherwallet-mobile-app/',
        logo: '/ecosystem/wallets/mew.svg',
      },
      {
        name: 'BlockFolio',
        url: 'https://www.orbs.com/orbs-is-now-available-on-blockfolio/',
        logo: '/ecosystem/wallets/blockfolio.svg',
      },
      {
        name: 'Status',
        url: 'https://www.orbs.com/orbs-staking-is-now-available-on-the-status-wallet-mobile-app/',
        logo: '/ecosystem/wallets/status.svg',
      },
      {
        name: 'Krystal',
        url: 'https://www.orbs.com/orbs-and-krystal-announce-a-partnership-focused-on-defi/',
        logo: '/ecosystem/wallets/krystal.svg',
      },
      {
        name: 'Token Pocket',
        url: 'https://www.orbs.com/orbs-staking-is-now-available-on-token-pocket-wallet-mobile-app/',
        logo: '/ecosystem/wallets/pocket.svg',
      },
      {
        name: 'imToken',
        url: 'https://www.orbs.com/orbs-tetra-staking-is-now-available-on-imtoken-wallet/',
        logo: '/ecosystem/wallets/imtoken.svg',
      },
      { name: "D'Cent", url: '', logo: '/ecosystem/wallets/dcent.svg' },
      {
        name: 'SafePal',
        url: 'https://www.orbs.com/Orbs-Staking-is-Now-Available-on-the-SafePal-Crypto-Wallet/',
        logo: '/ecosystem/wallets/safepal.svg',
      },
      {
        name: 'onto',
        url: 'https://www.orbs.com/Orbs-Staking-is-Now-Available-on-ONTO-Wallet/',
        logo: '/ecosystem/wallets/onto.svg',
      },
      {
        name: 'Coin98',
        url: 'https://www.orbs.com/Orbs-Multi-chain-Staking-is-Now-Available-on-the-Coin98-Crypto-Wallet/',
        logo: '/ecosystem/wallets/coin98.svg',
      },
      {
        name: 'Simplehold',
        url: 'https://www.orbs.com/ORBS-Added-to-SimpleHold-Wallet/',
        logo: '/ecosystem/wallets/simplehold.svg',
      },
      {
        name: 'Guarda wallet',
        url: 'https://www.orbs.com/Guarda-integrates-ORBS-token/',
        logo: '/ecosystem/wallets/guarda-wallet.png',
      },
      {
        name: 'Carbon',
        url: 'https://www.orbs.com/Carbon-Browser-adds-ORBS-to-the-wallet-functionality/',
        logo: '/ecosystem/wallets/carbon.png',
      },
      {
        name: 'blocbank',
        url: 'https://blog.blockbank.ai/new-defi-listing-orbs-89e27ee57326',
        logo: '/ecosystem/wallets/blobbank.png',
      },
    ],
  },
  {
    key: 'defi',
    entries: [
      {
        name: 'Balancer',
        url: 'https://pools.balancer.exchange/#/pool/0x795dfdfd413c4a9492cef5b58723f9fb3c8af624/',
        logo: '/ecosystem/defi/balancer.svg',
      },
      {
        name: 'Uniswap',
        url: 'https://app.uniswap.org/#/add/ETH/0xff56Cc6b1E6dEd347aA0B7676C85AB0B3D08B0FA',
        logo: '/ecosystem/defi/uniswap.svg',
      },
      { name: 'Defi.org', url: 'https://defi.org', logo: '/ecosystem/defi/defi.svg' },
      {
        name: 'Benchmark Protocol',
        url: 'https://medium.com/benchmarkprotocol/the-benchmark-protocol-team-is-excited-to-announce-that-the-orbs-network-token-orbs-will-be-b33ed13c6680',
        logo: '/ecosystem/defi/benchmark.svg',
      },
      {
        name: 'Pancakeswap',
        url: 'https://www.orbs.com/orbs-is-now-live-on-pancakeswap/',
        logo: '/ecosystem/defi/pancake.svg',
      },
      {
        name: 'Sushi',
        url: 'https://www.orbs.com/orbs-is-now-live-on-sushiswap/',
        logo: '/ecosystem/defi/sushiswap.svg',
      },
      {
        name: 'Kyber Network',
        url: 'https://www.orbs.com/orbs-is-now-live-on-kyber-dmm/',
        logo: '/ecosystem/defi/kyber.svg',
      },
      {
        name: '1inch',
        url: 'https://www.orbs.com/orbs-is-now-live-on-1inch-exchange/',
        logo: '/ecosystem/defi/1inch.svg',
      },
      {
        name: 'Alpaca Finance',
        url: 'https://www.orbs.com/orbs-added-to-alpaca-finance-vaults/',
        logo: '/ecosystem/defi/alpaca.svg',
      },
      {
        name: 'Beefy Finance',
        url: 'https://www.orbs.com/orbs-added-to-beefy-finance-vaults/',
        logo: '/ecosystem/defi/beefy.svg',
      },
      {
        name: 'QuickSwap',
        url: 'https://www.orbs.com/orbs-is-now-live-on-quickswap/',
        logo: '/ecosystem/defi/quickswap.svg',
      },
      {
        name: 'DinoSwap',
        url: 'https://www.orbs.com/Orbs-Extinction-Pool-Launched-on-DinoSwap/',
        logo: '/ecosystem/defi/dino.svg',
      },
      {
        name: 'KogeFarm',
        url: 'https://www.orbs.com/Orbs-Added-to-KogeFarm-Vaults/',
        logo: '/ecosystem/defi/kogefarm.svg',
      },
      {
        name: 'Solana Wormhole',
        url: 'https://www.orbs.com/Orbs-is-Live-on-the-Solana-Wormhole-Bridge/',
        logo: '/ecosystem/defi/wormhole.png',
      },
      {
        name: 'Trader Joe',
        url: 'https://www.orbs.com/ORBS-is-now-live-on-Trader-Joe/',
        logo: '/ecosystem/defi/trader-joe.svg',
      },
      {
        name: 'Pangolin',
        url: 'https://www.orbs.com/ORBS-is-Now-Available-on-Pangolin/',
        logo: '/ecosystem/defi/pangolin.svg',
      },
      { name: 'Rango', url: 'https://www.orbs.com/ORBS-is-now-live-on-Rango/', logo: '/ecosystem/defi/rango.jpg' },
      {
        name: 'snowball',
        url: 'https://www.orbs.com/Further-Expansion-on-Avalanche-Orbs-Goes-Live-on-Snowball/',
        logo: '/ecosystem/defi/snowball.svg',
      },
      {
        name: 'SpookySwap',
        url: 'https://www.orbs.com/ORBS-is-now-live-on-SpookySwap/',
        logo: '/ecosystem/defi/spookyswap.svg',
      },
      {
        name: 'WOWswap',
        url: 'https://www.orbs.com/orbs-added-to-wowswap/#:~:text=We%20are%20excited%20to%20announce,leverage%20on%20the%20WOWswap%20protocol.',
        logo: '/ecosystem/defi/wowswap.svg',
      },
      {
        name: 'Raydium',
        url: 'https://www.orbs.com/Orbs-is-now-live-on-Raydium/',
        logo: '/ecosystem/defi/raydium.svg',
      },
      { name: 'Serum', url: 'https://www.orbs.com/Serum/', logo: '/ecosystem/defi/serum.svg' },
      {
        name: 'spiritswap',
        url: 'https://www.orbs.com/ORBS-is-now-live-on-SpiritSwap/',
        logo: '/ecosystem/defi/spiritswap.svg',
      },
      {
        name: 'JPYC',
        url: 'https://www.orbs.com/New-ORBS-JPYC-Liquidity-Pool-Launches-on-QuickSwap/',
        logo: '/ecosystem/defi/jpyc.png',
      },
      {
        name: 'Orbit Bridge',
        url: 'https://www.orbs.com/ORBS-available-on-Orbit-Bridge-and-Megaton-Finance-DEX/',
        logo: '/ecosystem/defi/orbit.svg',
      },
      {
        name: 'Megaton Finance',
        url: 'https://www.orbs.com/ORBS-available-on-Orbit-Bridge-and-Megaton-Finance-DEX/',
        logo: '/ecosystem/defi/megaton.svg',
      },
      { name: 'TonSwap', url: 'https://tonswap.org/swap/tokens', logo: '/ecosystem/defi/tonswap.svg' },
      {
        name: 'Bitdroplet',
        url: 'https://www.orbs.com/bitdroplet-lists-orbs-token/',
        logo: '/ecosystem/defi/Bitdroplet.png',
      },
      { name: 'ston.fi', url: 'https://www.orbs.com/ORBS-added-to-STONfi/', logo: '/ecosystem/defi/ston-fi.svg' },
      {
        name: 'axelar',
        url: 'https://www.orbs.com/Orbs-integrates-with-Satellite-by-Axelar/',
        logo: '/ecosystem/defi/axelar.svg',
      },
      {
        name: 'Satellite bridge',
        url: 'https://www.orbs.com/Orbs-integrates-with-Satellite-by-Axelar/',
        logo: '/ecosystem/defi/satellite.svg',
      },
      {
        name: 'chronos',
        url: 'https://www.orbs.com/ORBS-is-now-available-on-Chronos-DEX/',
        logo: '/ecosystem/defi/chronos.webp',
      },
      {
        name: 'Arken',
        url: 'https://www.orbs.com/orbs-is-now-available-on-arken-finance/',
        logo: '/ecosystem/defi/arken.webp',
      },
      {
        name: 'SwapSpace',
        url: 'https://swapspace.co/exchange/step1?to=orbs&toNetwork=erc20&from=btc&fromNetwork=btc&amount=0.1',
        logo: '/ecosystem/defi/SwapSpace.jpg',
      },
      {
        name: 'Squid',
        url: 'https://www.orbs.com/Orbs-integrates-with-Squid-Router-for-Cross-Chain-Swaps/',
        logo: '/ecosystem/defi/squid.png',
      },
    ],
  },
  {
    key: 'media',
    entries: [{ name: 'inboundjunction', url: '', logo: '/ecosystem/media/inbound.svg' }],
  },
  {
    key: 'governance',
    entries: [
      { name: 'Snapshot', url: 'https://snapshot.org/#/orbs-network.eth', logo: '/ecosystem/governance/snapshot.png' },
    ],
  },
]
