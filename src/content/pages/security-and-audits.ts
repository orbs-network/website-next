/** Reports apply to their stated contracts and versions, not the entire stack. */
export const SPOT_AUDITS = [
  { id: 'astraInitial', href: 'https://github.com/orbs-network/spot/blob/HEAD/Audit-AstraSec.pdf' },
  { id: 'astraUpdated', href: 'https://github.com/orbs-network/spot/blob/HEAD/Audit2-AstraSec.pdf' },
] as const

export const EARLIER_SPOT_AUDITS = [
  { id: 'peckShield', href: 'https://github.com/orbs-network/twap/blob/master/Audit-Report-PeckShield.pdf' },
  { id: 'rdAuditors', href: 'https://github.com/orbs-network/twap/blob/master/Audit-Report-RDAuditors.pdf' },
] as const

export const SECURITY_SOURCES = [
  { id: 'spot', href: 'https://github.com/orbs-network/spot' },
  { id: 'network', href: 'https://github.com/orbs-network' },
] as const
