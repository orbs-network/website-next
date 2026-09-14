/**
 * The white-paper library: six categories, 23 papers, each with a PDF.
 *
 * Structure only — titles and abstracts are catalog copy, because the Japanese
 * versions are real translations (24 of 24 titles) and would otherwise have
 * nowhere to live. Dates, thumbnails and PDF paths are locale-independent and
 * stay here.
 *
 * Assets were copied out of the legacy repo into `public/white-papers/`. The
 * thumbnails went through `scripts/optimize-images.mjs` on the way (7.1 MB ->
 * 1.8 MB); the PDFs are the documents themselves and are committed as-is.
 */

export type WhitePaper = {
  /** URL segment under /white-papers/, and the catalog key for its copy. */
  slug: string
  /** Publication date as the legacy content states it, e.g. 'January 2023'. */
  date: string
  image: string
  pdf: string
  /**
   * Editions of the same paper in another language, where one exists.
   *
   * Five papers have them. They are offered as extra links on the paper page
   * rather than through localised routes, because the page itself is
   * English-only — see the note on `/white-papers/[paper]`. Without this the
   * migration would simply lose five documents that are published today.
   */
  pdfByLocale?: Partial<Record<'ja' | 'ko', string>>
}

export type WhitePaperCategory = {
  key: string
  papers: readonly WhitePaper[]
}

export const WHITE_PAPER_CATEGORIES: readonly WhitePaperCategory[] = [
  {
    key: 'proofOfStake',
    papers: [
      {
        slug: 'Orbs-PoS-V3-Multi-chain-Staking',
        date: 'March 2022',
        image: '/white-papers/img/Orbs-PoS-V3-Multi-chain-Staking.jpg',
        pdf: '/white-papers/docs/Polygon-Staking-due-date.pdf',
      },
      {
        slug: 'orbs-pos-v2-the-age-of-guardians',
        date: 'July 2020',
        image: '/white-papers/img/orbs-pos-v2-the-age-of-guardians.png',
        pdf: '/white-papers/docs/ORBS_V2-The-Age-of-Guardians_V2.5.pdf',
        pdfByLocale: {
          ja: '/white-papers/docs/JP_ CONTENT-OVERVIEW_V2.5-The-Age-of-Guardians_Nov20.pdf',
          ko: '/white-papers/docs/KR_ORBS_V2-The-Age-of-Guardians_V2.5.pdf',
        },
      },
      {
        slug: 'proof-of-stake-ecosystem',
        date: 'March 2019',
        image: '/white-papers/img/proof-of-stake-ecosystem.png',
        pdf: '/white-papers/docs/Orbs-Universe-and-Proof-of-Stake-Ecosystem.pdf',
      },
    ],
  },
  {
    key: 'whitePapers',
    papers: [
      {
        slug: 'orbs-technology-overview-2',
        date: 'May 2019',
        image: '/white-papers/img/orbs-technology-overview-2.png',
        pdf: '/white-papers/docs/Orbs-Technology-Overview.pdf',
      },
      {
        slug: 'orbs-position-paper',
        date: 'April 2018',
        image: '/white-papers/img/orbs-position-paper.png',
        pdf: '/white-papers/docs/Orbs-Position-Paper-OFFICIAL-V1.7.pdf',
        pdfByLocale: { ko: '/white-papers/docs/ORBS_position_paper_1_7_0_KR_001.pdf' },
      },
    ],
  },
  {
    key: 'workingPapers',
    papers: [
      {
        slug: 'ton-vote',
        date: 'March 2023',
        image: '/white-papers/img/ton-vote.png',
        pdf: '/white-papers/docs/TonVote.pdf',
      },
      {
        slug: 'dTWAP',
        date: 'January 2023',
        image: '/white-papers/img/dTWAP.png',
        pdf: '/white-papers/docs/dTWAP.pdf',
      },
      {
        slug: 'use-of-ethereum-as-a-base-layer-for-pos-and-poa-platforms',
        date: 'February 2019',
        image: '/white-papers/img/use-of-ethereum-as-a-base-layer-for-pos-and-poa-platforms.png',
        pdf: '/white-papers/docs/Use-of-Ethereum-as-a-Base-Layer-for-PoA_PoS-Platforms-.pdf',
      },
      {
        slug: 'blockchain-virtualization-a-necessity-for-real-world-dapps',
        date: 'August 2018',
        image: '/white-papers/img/blockchain-virtualization-a-necessity-for-real-world-dapps.png',
        pdf: '/white-papers/docs/Blockchain-Virtualization.pdf',
      },
      {
        slug: 'eliminating-the-security-vs-scalability-dilemma-randomized-committee-consensus-protocols',
        date: 'August 2018',
        image: '/white-papers/img/eliminating-the-security.png',
        pdf: '/white-papers/docs/Randomized-Committee-Consensus-.pdf',
      },
      {
        slug: 'blockchain-architecture-considerations-to-compete-with-paas-cloud-services',
        date: 'August 2018',
        image: '/white-papers/img/blockchain-architecture-considerations-to-compete-with-paas-cloud-services.png',
        pdf: '/white-papers/docs/Blockchain-Architecture-Considerations-to-Mimic-Cloud-Services.pdf',
      },
    ],
  },
  {
    key: 'researchPapers',
    papers: [
      {
        slug: 'helix-consensus-whitepaper',
        date: 'April 2018',
        image: '/white-papers/img/helix-consensus-whitepaper.png',
        pdf: '/white-papers/docs/Helix-V1.3.pdf',
      },
      {
        slug: 'enforcing-fairness-in-blockchain-transaction-ordering',
        date: 'May 2019',
        image: '/white-papers/img/enforcing-fairness-in-blockchain-transaction-ordering.png',
        pdf: '/white-papers/docs/fairness_enforcement1.pdf',
      },
      {
        slug: 'fully-distributed-group-signatures',
        date: 'April 2019',
        image: '/white-papers/img/fully-distributed-group-signatures.png',
        pdf: '/white-papers/docs/Crypto_Group_signatures-2.pdf',
      },
      {
        slug: 'rational-threshold-cryptosystems',
        date: 'January 2019',
        image: '/white-papers/img/rational-threshold-cryptosystems.png',
        pdf: '/white-papers/docs/Rational-Threshold-Cryptosystems.pdf',
      },
      {
        slug: 'accelerating-decentralized-execution-of-blockchain',
        date: 'August 2018',
        image: '/white-papers/img/accelerating-decentralized-execution-of-blockchain.png',
        pdf: '/white-papers/docs/execution_partition.pdf',
      },
      {
        slug: 'bloom-filter-with-a-false-positive-free-zone',
        date: 'April 2018',
        image: '/white-papers/img/bloom-filter-with-a-false-positive-free-zone.png',
        pdf: '/white-papers/docs/infocom18_Bloom.pdf',
      },
    ],
  },
  {
    key: 'tokenSpecifications',
    papers: [
      {
        slug: 'orbs-token-distribution',
        date: 'April 2019',
        image: '/white-papers/img/Orbs-Token-Distribution.png',
        pdf: '/white-papers/docs/Orbs-Token-Distribution.pdf',
      },
      {
        slug: 'Orbs-Operation-Fees',
        date: 'March 2019',
        image: '/white-papers/img/V6-Orbs-Operation-Fees-Orbs-March-27-2019.png',
        pdf: '/white-papers/docs/V6-Orbs-Operation-Fees-Orbs-March-27-2019.pdf',
      },
    ],
  },
  {
    key: 'grants',
    papers: [
      {
        slug: 'token-utility-research',
        date: 'January 2024',
        image: '/white-papers/img/token-utility-research.jpg',
        pdf: '/white-papers/docs/Token-Utility-Research.pdf',
      },
      {
        slug: 'grants',
        date: 'October 2022',
        image: '/white-papers/img/Grants.jpg',
        pdf: '/white-papers/docs/Grants.pdf',
      },
      {
        slug: 'orbs-grant-grogram-second-call-for-grants',
        date: 'August 2021',
        image: '/white-papers/img/orbs-grant-grogram-second-call-for-grants.png',
        pdf: '/white-papers/docs/orbs-grant-grogram-second-call-for-grants.pdf',
        pdfByLocale: { ko: '/white-papers/docs/orbs-grant-grogram-second-call-for-grants_KO.pdf' },
      },
      {
        slug: 'orbs-grant-program',
        date: 'August 2020',
        image: '/white-papers/img/orbs-grant-program.png',
        pdf: '/white-papers/docs/Orbs-Grant-Program.pdf',
        pdfByLocale: { ja: '/white-papers/docs/Orbs-Grant-Program-JP.pdf' },
      },
    ],
  },
]

/**
 * Papers with a page but no card on the index.
 *
 * Five sections of the Age of Guardians paper, published as standalone PDFs.
 * The legacy index never listed them, but every one returns 200 today — so
 * they need routes or the migration deletes five live URLs. They carry no
 * thumbnail or date because the legacy content has none for them.
 */
const UNLISTED_PAPERS: readonly WhitePaper[] = [
  {
    slug: 'orbs-pos-v2-the-age-of-guardians-section-election-committees',
    date: '',
    image: '',
    pdf: '/white-papers/docs/age_of_guardians_doc_part_election_committees.pdf',
  },
  {
    slug: 'orbs-pos-v2-the-age-of-guardians-section-minimum-self-delegation',
    date: '',
    image: '',
    pdf: '/white-papers/docs/age_of_guardians_doc_part_minimum_self_delegation.pdf',
  },
  {
    slug: 'orbs-pos-v2-the-age-of-guardians-section-pos-on-ethereum',
    date: '',
    image: '',
    pdf: '/white-papers/docs/age_of_guardians_doc_part_pos_on_ethereum.pdf',
  },
  {
    slug: 'orbs-pos-v2-the-age-of-guardians-section-rewards-distributions',
    date: '',
    image: '',
    pdf: '/white-papers/docs/age_of_guardians_doc_part_reward_distributions.pdf',
  },
  {
    slug: 'orbs-pos-v2-the-age-of-guardians-section-rewards-fees-bootstrap-fund',
    date: '',
    image: '',
    pdf: '/white-papers/docs/age_of_guardians_doc_part_rewards_fees_and_bootstrap_fund.pdf',
  },
]

/**
 * Flat lookup for the per-paper route.
 *
 * Index cards PLUS the unlisted sections: what the index shows and what has a
 * URL are different questions, and `generateStaticParams` wants the second.
 */
export const WHITE_PAPERS: readonly WhitePaper[] = [
  ...WHITE_PAPER_CATEGORIES.flatMap((c) => c.papers),
  ...UNLISTED_PAPERS,
]
