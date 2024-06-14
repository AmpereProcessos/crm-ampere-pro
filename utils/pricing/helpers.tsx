import { stateCities } from '../estados_cidades'
import { TPartnerSimplifiedDTO } from '../schemas/partner.schema'
import { TPricingMethodConditionType, TPricingMethodItemResultItem } from '../schemas/pricing-method.schema'
import { ElectricalInstallationGroups, EletricalPhasesTypes, StructureTypes, YesOrNoOptions } from '../select-options'
import { TPricingConditionData, TPricingVariableData } from './methods'

type TVariablesAlias = { label: string; value: keyof TPricingVariableData; type: 'general' | 'technical-analysis' | 'cumulative' }
export const variablesAlias: TVariablesAlias[] = [
  { label: 'VALOR DO KIT', value: 'kit', type: 'general' },
  { label: 'VALOR DO PLANO', value: 'plan', type: 'general' }, // DISABLED WHILE PLANS FUNCTIONALITY IS NOT WORKING YET
  { label: 'VALOR DO PRODUTO', value: 'product', type: 'general' },
  { label: 'VALOR DO SERVIÇO', value: 'service', type: 'general' },
  { label: 'Nº DE MÓDULOS', value: 'numModulos', type: 'general' },
  { label: 'Nº DE INVERSORES', value: 'numInversores', type: 'general' },
  { label: 'POTÊNCIA PICO', value: 'potenciaPico', type: 'general' },
  { label: 'DISTÂNCIA', value: 'distancia', type: 'general' },
  { label: 'VALOR DE REFERÊNCIA', value: 'valorReferencia', type: 'general' },
  { label: 'CONSUMO DE ENERGIA', value: 'consumoEnergiaMensal', type: 'general' },
  { label: 'TARIFA DE ENERGIA', value: 'tarifaEnergia', type: 'general' },
  { label: 'CUSTOS DE INSTALAÇÃO', value: 'custosInstalacao', type: 'technical-analysis' },
  { label: 'CUSTOS DE PADRÃO', value: 'custosPadraoEnergia', type: 'technical-analysis' },
  { label: 'CUSTOS DE ESTRUTURA', value: 'custosEstruturaInstalacao', type: 'technical-analysis' },
  { label: 'OUTROS CUSTOS', value: 'custosOutros', type: 'technical-analysis' },
  { label: 'TOTAL FINAL', value: 'total', type: 'cumulative' },
  { label: 'TOTAL FATURÁVEL FINAL', value: 'totalFaturavelFinal', type: 'cumulative' },
  { label: 'TOTAL NÃO FATURÁVEL FINAL', value: 'totalNaoFaturavelFinal', type: 'cumulative' },
  { label: 'TOTAL DE CUSTOS FATURÁVEIS', value: 'totalFaturavelCustos', type: 'cumulative' },
  { label: 'TOTAL DE CUSTOS NÃO FATURÁVEIS', value: 'totalNaoFaturavelCustos', type: 'cumulative' },
]
export const cumulativeVariablesValues = variablesAlias.filter((v) => v.type == 'cumulative').map((v) => v.value) as string[]
type TConditionsAlias = {
  label: string
  value: keyof TPricingConditionData
  types: TPricingMethodConditionType[]
}
export const conditionsAlias: TConditionsAlias[] = [
  { label: 'ESTADO', value: 'uf', types: ['IGUAL_TEXTO', 'INCLUI_LISTA'] },
  { label: 'CIDADE', value: 'cidade', types: ['IGUAL_TEXTO', 'INCLUI_LISTA'] },
  { label: 'TOPOLOGIA', value: 'topologia', types: ['IGUAL_TEXTO', 'INCLUI_LISTA'] },
  { label: 'TIPO DE ESTRUTURA', value: 'tipoEstrutura', types: ['IGUAL_TEXTO', 'INCLUI_LISTA'] },
  { label: 'GRUPO DA INSTALAÇÃO', value: 'grupoInstalacao', types: ['IGUAL_TEXTO', 'INCLUI_LISTA'] },
  { label: 'TIPO DE CONEXÃO ELÉTRICA', value: 'faseamentoEletrico', types: ['IGUAL_TEXTO', 'INCLUI_LISTA'] },
  { label: 'PARCEIRO', value: 'idParceiro', types: ['IGUAL_TEXTO', 'INCLUI_LISTA'] },
  { label: 'Nº DE MÓDULOS', value: 'numModulos', types: ['IGUAL_NÚMERICO', 'MAIOR_QUE_NÚMERICO', 'MENOR_QUE_NÚMERICO', 'INTERVALO_NÚMERICO'] },
  { label: 'Nº DE INVERSORES', value: 'numInversores', types: ['IGUAL_NÚMERICO', 'MAIOR_QUE_NÚMERICO', 'MENOR_QUE_NÚMERICO', 'INTERVALO_NÚMERICO'] },
  { label: 'POTÊNCIA PICO', value: 'potenciaPico', types: ['IGUAL_NÚMERICO', 'MAIOR_QUE_NÚMERICO', 'MENOR_QUE_NÚMERICO', 'INTERVALO_NÚMERICO'] },
  { label: 'DISTÂNCIA', value: 'distancia', types: ['IGUAL_NÚMERICO', 'MAIOR_QUE_NÚMERICO', 'MENOR_QUE_NÚMERICO', 'INTERVALO_NÚMERICO'] },
  { label: 'VALOR DE REFERÊNCIA', value: 'valorReferencia', types: ['IGUAL_NÚMERICO', 'MAIOR_QUE_NÚMERICO', 'MENOR_QUE_NÚMERICO', 'INTERVALO_NÚMERICO'] },
  { label: 'ATIVAÇÃO DE REFERÊNCIA', value: 'ativacaoReferencia', types: ['IGUAL_TEXTO'] },
]

export function formatFormulaItem(value: string) {
  if (value.includes('[') && value.includes(']')) {
    const variable = variablesAlias.find((c) => c.value == value.replace('[', '').replace(']', ''))
    if (!variable) return 'NÃO DEFINIDO'
    return variable.label
  }
  return value
}
export function formatCondition(value: string) {
  const condition = conditionsAlias.find((c) => c.value == value)
  if (!condition) return 'NÃO DEFINIDO'
  return condition.label
}

type FormatConditionValueParams = {
  conditionVariable: keyof TPricingConditionData
  conditionValue: string
  additional: {
    partners: TPartnerSimplifiedDTO[]
  }
}
export function formatConditionValue({ conditionVariable, conditionValue, additional }: FormatConditionValueParams) {
  if (conditionVariable == 'uf') {
    const ufLabel = Object.keys(stateCities)
      .map((k, index) => ({ id: index + 1, label: k, value: k }))
      .find((k) => k.value == conditionValue)?.label
    return ufLabel || 'NÃO DEFINIDO'
  }
  if (conditionVariable == 'cidade') {
    const cityLabel = Object.entries(stateCities)
      .map(([uf, cities]) => cities)
      .flat(1)
      .map((c, index) => ({ id: index + 1, label: c, value: c }))
      .find((c) => c.value == conditionValue)?.label
    return cityLabel || 'NÃO DEFINIDO'
  }

  if (conditionVariable == 'topologia') {
    const topologyLabel = ['INVERSOR', 'MICRO-INVERSOR']
      .map((t, index) => ({ id: index + 1, label: t, value: t }))
      .find((t) => t.value == conditionValue)?.label
    return topologyLabel || 'NÃO DEFINIDO'
  }
  if (conditionVariable == 'tipoEstrutura') {
    const structureTypeLabel = StructureTypes.find((s) => s.value == conditionValue)?.label
    return structureTypeLabel || 'NÃO DEFINIDO'
  }
  if (conditionVariable == 'grupoInstalacao') {
    const installationGroupLabel = ElectricalInstallationGroups.find((g) => g.value == conditionValue)?.label
    return installationGroupLabel || 'NÃO DEFINIDO'
  }
  if (conditionVariable == 'faseamentoEletrico') {
    const electricalConnection = EletricalPhasesTypes.find((g) => g.value == conditionValue)?.label
    return electricalConnection || 'NÃO DEFINIDO'
  }
  if (conditionVariable == 'idParceiro') {
    const partnerLabel = additional.partners.map((p) => ({ id: p._id, label: p.nome, value: p._id })).find((p) => p.value == conditionValue)?.label
    return partnerLabel
  }
  if (conditionVariable == 'numModulos') return conditionValue.toString()
  if (conditionVariable == 'numInversores') return conditionValue.toString()
  if (conditionVariable == 'potenciaPico') return conditionValue.toString()
  if (conditionVariable == 'distancia') return conditionValue.toString()
  if (conditionVariable == 'valorReferencia') return conditionValue.toString()
  if (conditionVariable == 'ativacaoReferencia') return conditionValue.toString()
}

type RenderConditionPhraseParams = {
  condition: TPricingMethodItemResultItem['condicao']
  partners: TPartnerSimplifiedDTO[]
}
export function renderConditionPhrase({ condition, partners }: RenderConditionPhraseParams) {
  const isConditionAplicable = condition.aplicavel
  const conditionType = condition.tipo
  const conditionAlias = formatCondition(condition.variavel || '')
  if (!isConditionAplicable) return <h1 className="text-start text-sm font-bold leading-none tracking-tight text-cyan-500">FÓRMULA GERAL:</h1>
  if (!conditionType || conditionType == 'IGUAL_TEXTO' || conditionType == 'IGUAL_NÚMERICO')
    return (
      <h1 className="text-start text-sm font-bold leading-none tracking-tight text-cyan-500">
        {`SE ${formatCondition(condition.variavel || '')} FOR IGUAL A ${formatConditionValue({
          conditionVariable: condition.variavel as keyof TPricingConditionData,
          conditionValue: condition.igual || '',
          additional: {
            partners: partners || [],
          },
        })}:`}
      </h1>
    )
  if (conditionType == 'MAIOR_QUE_NÚMERICO')
    return (
      <h1 className="text-start text-sm font-bold leading-none tracking-tight text-cyan-500">
        {`SE ${formatCondition(condition.variavel || '')} FOR MAIOR QUE ${condition.maiorQue || 0}:`}
      </h1>
    )
  if (conditionType == 'MENOR_QUE_NÚMERICO')
    return (
      <h1 className="text-start text-sm font-bold leading-none tracking-tight text-cyan-500">
        {`SE ${formatCondition(condition.variavel || '')} FOR MENOR QUE ${condition.menorQue || 0}:`}
      </h1>
    )
  if (conditionType == 'INTERVALO_NÚMERICO')
    return (
      <h1 className="text-start text-sm font-bold leading-none tracking-tight text-cyan-500">
        {`SE ${formatCondition(condition.variavel || '')} ESTIVER ENTRE ${condition.entre?.minimo || 0} E ${condition.entre?.maximo || 0}:`}
      </h1>
    )
  const conditionValues = condition.inclui ? condition.inclui.join(', ') : ''
  if (conditionType == 'INCLUI_LISTA')
    return (
      <h1 className="text-start text-sm font-bold leading-none tracking-tight text-cyan-500">
        {`SE ${formatCondition(condition.variavel || '')} FOR UMA DAS OPÇÕES A SEGUIR ${conditionValues}:`}
      </h1>
    )
}

type GetConditionOptions = {
  variable: keyof TPricingConditionData
  additional: {
    partners: TPartnerSimplifiedDTO[]
  }
}
export function getConditionOptions({ variable, additional }: GetConditionOptions) {
  if (variable == 'uf') return Object.keys(stateCities).map((k, index) => ({ id: index + 1, label: k, value: k }))
  if (variable == 'cidade')
    return Object.entries(stateCities)
      .map(([uf, cities]) => cities)
      .flat(1)
      .map((c, index) => ({ id: index + 1, label: c, value: c }))

  if (variable == 'topologia') return ['INVERSOR', 'MICRO-INVERSOR'].map((t, index) => ({ id: index + 1, label: t, value: t }))
  if (variable == 'tipoEstrutura') return StructureTypes
  if (variable == 'grupoInstalacao') return ElectricalInstallationGroups
  if (variable == 'faseamentoEletrico') return EletricalPhasesTypes
  if (variable == 'idParceiro') return additional.partners.map((p) => ({ id: p._id, label: p.nome, value: p._id }))
  if (variable == 'ativacaoReferencia') return YesOrNoOptions
  return []
}

export const operators = ['(', ')', '/', '*', '+', '-']
