import { formatToMoney } from '@/utils/methods'
import { TOpportunityDTOWithClient } from '@/utils/schemas/opportunity.schema'
import { TProposalDTO } from '@/utils/schemas/proposal.schema'
import dayjs from 'dayjs'
import ptBr from 'dayjs/locale/pt-br'
dayjs.locale(ptBr)
type GetTemplateDataParams = {
  opportunity: TOpportunityDTOWithClient
  proposal: TProposalDTO
}
export function getInsuranceTemplateData({ opportunity, proposal }: GetTemplateDataParams) {
  const seller = opportunity.responsaveis.find((r) => r.papel == 'VENDEDOR')
  const sdr = opportunity.responsaveis.find((r) => r.papel == 'SDR')
  function getInstallmentsText(value: number) {
    const FIX_UNIQUE_INSTALLMENT_VALUE = 200
    const MAX_POSSIBLE_INSTALLMENTS = 12
    const maxInstallments =
      Math.floor(value / FIX_UNIQUE_INSTALLMENT_VALUE) > MAX_POSSIBLE_INSTALLMENTS
        ? MAX_POSSIBLE_INSTALLMENTS
        : Math.floor(value / FIX_UNIQUE_INSTALLMENT_VALUE)
    const maxInstallmentsValue = value / maxInstallments

    return `EM ATÉ ${maxInstallments}x DE ${formatToMoney(maxInstallmentsValue)}`
  }
  return {
    title: opportunity.nome,
    fontSize: 10,
    textColor: '#333333',
    data: {
      clientName: opportunity.cliente.nome,
      clientRegistry: opportunity.cliente.cpfCnpj,
      clientCity: opportunity.localizacao.cidade,
      opportunityIdentifier: opportunity.identificador,
      sellerName: seller?.nome || sdr?.nome || '',
      sellerPhone: seller?.telefone || sdr?.telefone || '',
      proposalId: proposal._id,
      proposalDate: dayjs().format('DD [de] MMMM [de] YYYY'),
      referenceValue: formatToMoney(proposal.premissas.valorReferencia || 0),
      investment: `${formatToMoney(proposal.valor)}/ ANO`,
      installments: getInstallmentsText(proposal.valor),
    },
  }
}
