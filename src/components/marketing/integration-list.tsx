import Image from 'next/image'
import { H3 } from '@/app/components/typography'
import {
  INTEGRATION_CHAINS,
  integrationPartner,
  type IntegrationPartner,
  type IntegrationPartnerId,
} from '@/content/shared/integrations'

/** White backing and dark-ink marks in both themes, as approved by Sarbloc. */
export function IntegrationMark({
  partner,
  decorative = false,
}: {
  partner: IntegrationPartner
  decorative?: boolean
}) {
  return (
    partner.logo && (
      <div className="flex h-24 items-center justify-center bg-white p-5">
        <Image
          src={partner.logo.src}
          width={partner.logo.width}
          height={partner.logo.height}
          alt={decorative ? '' : partner.name}
          sizes="12rem"
          className="h-auto max-h-10 w-auto max-w-full object-contain"
        />
      </div>
    )
  )
}

export function FeaturedIntegrations({
  partners,
  showProducts = false,
}: {
  partners: readonly IntegrationPartnerId[]
  showProducts?: boolean
}) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {partners.map((id) => {
        const partner = integrationPartner(id)
        return (
          <li key={id}>
            <IntegrationMark partner={partner} decorative={showProducts} />
            {showProducts && (
              <div className="pt-5">
                <H3 className="text-h4">{partner.name}</H3>
                <p className="mt-3 text-p text-fg-muted">
                  {[partner.dspot && 'dSPOT', partner.dperps && 'dPERPS'].filter(Boolean).join(' / ')}
                </p>
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

/** A chain mapping, without inferring other features or custody models. */
export function IntegrationList({
  partners,
  product,
  label,
  partnerHeader,
  chainHeader,
}: {
  partners: readonly IntegrationPartnerId[]
  product: 'dspot' | 'dperps' | 'stopLossTakeProfit'
  label: string
  partnerHeader: string
  chainHeader: string
}) {
  return (
    <table className="w-full table-fixed border-collapse text-left text-p">
      <caption className="sr-only">{label}</caption>
      <thead>
        <tr className="border-b border-border">
          <th scope="col" className="w-2/5 py-4 pr-4 font-medium">
            {partnerHeader}
          </th>
          <th scope="col" className="py-4 font-medium">
            {chainHeader}
          </th>
        </tr>
      </thead>
      <tbody>
        {partners.map((id) => {
          const partner = integrationPartner(id)
          return (
            <tr key={id} className="border-b border-border">
              <th scope="row" className="break-words py-5 pr-4 align-top font-medium">
                {partner.name}
              </th>
              <td className="break-words py-5 align-top text-fg-muted">
                {partner[product]?.map((chain) => INTEGRATION_CHAINS[chain].name).join(', ')}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
