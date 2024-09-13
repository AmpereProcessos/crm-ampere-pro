import { formatToMoney, getEstimatedGen, getInverterStr, getModulesStr, getPeakPotByModules } from '@/utils/methods'

import dayjs from 'dayjs'
import ptBr from 'dayjs/locale/pt-br'
import { getExpenseAndEconomyProgression } from '../general'
import { formatDecimalPlaces } from '@/lib/methods/formatting'
import { TOpportunityDTOWithClient } from '@/utils/schemas/opportunity.schema'
import { TProposal, TProposalDTO } from '@/utils/schemas/proposal.schema'
import { getInvertersStrByProducts, getModulesStrByProducts } from '@/lib/methods/extracting'

dayjs.locale(ptBr)

type GetTemplateDataParams = {
  opportunity: TOpportunityDTOWithClient
  proposal: TProposalDTO
}
export function getSimpleTemplate2024Data({ opportunity, proposal }: GetTemplateDataParams) {
  const paInformation = !!proposal.precificacao.find((p) => p.descricao.includes('PADRÃO') && p.valorFinal > 10) ? 'ADEQUAÇÕES DE PADRÃO' : ''
  const seller = opportunity.responsaveis.find((r) => r.papel == 'VENDEDOR')
  const sdr = opportunity.responsaveis.find((r) => r.papel == 'SDR')
  // Getting the progression array of billing prices, payback, and other stuff
  const yearsQty = 12
  const Table = getExpenseAndEconomyProgression({ proposal, opportunity, yearsQty })
  const SingleYearScopedTable = Table.slice(0, 12)
  // Expense related
  const averageEnergyConsumption = proposal.premissas.consumoEnergiaMensal || 0
  const monthlyEnergyExpense = (proposal.premissas.consumoEnergiaMensal || 0) * (proposal.premissas.tarifaEnergia || 0)
  const annualEnergyExpense = (proposal.premissas.consumoEnergiaMensal || 0) * (proposal.premissas.tarifaEnergia || 0) * 12
  const twelveYearsEnergyExpense = Table.reduce((acc, current) => acc + current.ConventionalEnergyBill, 0)

  // Economy related
  const estimatedGeneration = getEstimatedGen(
    proposal.potenciaPico || 0,
    opportunity.localizacao.cidade,
    opportunity.localizacao.uf,
    proposal.premissas.orientacao || 'NORTE'
  )
  const monthlySavedValue =
    SingleYearScopedTable.reduce((acc, current) => acc + (current.ConventionalEnergyBill - current.EnergyBillValue), 0) / SingleYearScopedTable.length
  const annualSavedValue = (12 * Table.reduce((acc, current) => acc + (current.ConventionalEnergyBill - current.EnergyBillValue), 0)) / Table.length
  const twelveYearsSavedValue = Table.reduce((acc, current) => acc + (current.ConventionalEnergyBill - current.EnergyBillValue), 0)
  const obj = {
    title: opportunity.nome,
    fontSize: 10,
    textColor: '#333333',
    data: {
      clientName: opportunity.cliente.nome,
      clientRegistry: opportunity.cliente.cpfCnpj,
      clientCity: opportunity.localizacao.cidade,
      sellerPhone: seller?.telefone || sdr?.telefone || '',
      proposePower: proposal.potenciaPico ? `${formatDecimalPlaces(proposal.potenciaPico)} kWp` : '0 kWp',
      proposeDate: dayjs().format('DD [de] MMMM [de] YYYY'),
      sellerName: seller?.nome || sdr?.nome || '',
      energyConsumption: `${formatDecimalPlaces(averageEnergyConsumption)} kWh`,
      energyExpense: formatToMoney(monthlyEnergyExpense),
      energyExpenseAnnually: formatToMoney(annualEnergyExpense),
      energyExpenseInScope: formatToMoney(twelveYearsEnergyExpense),
      modules: getModulesStrByProducts(proposal.produtos),
      inverters: getInvertersStrByProducts(proposal.produtos),
      modulesWarranty: `${Math.max(...proposal.produtos.filter((p) => p.categoria == 'MÓDULO').map((x) => (x.garantia ? x.garantia : 0)))} anos`,
      invertersWarranty: `${Math.max(...proposal.produtos.filter((p) => p.categoria == 'INVERSOR').map((x) => (x.garantia ? x.garantia : 0)))} anos`,
      generationMonthly: `${formatDecimalPlaces(estimatedGeneration)} kWh/mês`,
      economyMonthly: formatToMoney(monthlySavedValue),
      economyAnually: formatToMoney(annualSavedValue),
      economyInScope: formatToMoney(twelveYearsSavedValue),
      investment: proposal.valor ? formatToMoney(proposal.valor) : 'R$ N/A',
      proposeId: `#${proposal._id}`,
      paInformation: paInformation,
      opportunityIdentifier: opportunity.identificador,
    },
  }

  return obj
}
