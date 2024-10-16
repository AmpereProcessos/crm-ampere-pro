import { formatDecimalPlaces, formatLocation } from '@/lib/methods/formatting'
import { formatToMoney, getEstimatedGen } from '@/utils/methods'
import { TOpportunityDTOWithClient } from '@/utils/schemas/opportunity.schema'
import { TProposalDTO } from '@/utils/schemas/proposal.schema'

type GetTemplateDataParams = {
  opportunity: TOpportunityDTOWithClient
  proposal: TProposalDTO
}
export function getMonitoringTemplateData({ opportunity, proposal }: GetTemplateDataParams) {
  const seller = opportunity.responsaveis.find((r) => r.papel == 'VENDEDOR')
  const sdr = opportunity.responsaveis.find((r) => r.papel == 'SDR')

  const clientCity = `${opportunity.localizacao.cidade}${opportunity.localizacao.uf ? `(${opportunity.localizacao.uf})` : ''}`

  const monthlyEnergyGeneration = proposal.premissas.valorReferencia || 0
  const dailyEnergyGeneration = monthlyEnergyGeneration / 30

  const dailyMonetaryLoss = dailyEnergyGeneration * (proposal.premissas.tarifaEnergia || 1)

  const sellerStr = seller ? `${seller.nome}${seller.telefone ? ` (${seller.telefone})` : ''}` : null
  const sdrStr = sdr ? `${sdr.nome}${sdr.telefone ? ` (${sdr.telefone})` : ''}` : null
  return {
    title: opportunity.nome,
    fontSize: 10,
    textColor: '#333333',
    data: {
      clientName: opportunity.cliente.nome,
      clientRegistry: opportunity.cliente.cpfCnpj || '',
      clientCity: clientCity,
      clientAddress: formatLocation({ location: opportunity.localizacao }),
      dailyEnergyGeneration: `${formatDecimalPlaces(dailyEnergyGeneration)} kWh`,
      dailyMonetaryLoss: formatToMoney(dailyMonetaryLoss),
      signaturePrice: `${formatToMoney(proposal.valor)}`,
      seller: sellerStr || sdrStr || '',
      opportunityIdentifier: opportunity.identificador || '',
      proposalId: `#${proposal._id}`,
    },
  }
}
