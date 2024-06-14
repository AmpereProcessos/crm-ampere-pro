import { z } from 'zod'
import { processAutomationConditionAlias } from './helpers'

export const ProcessAutomationConditionTypes = z.enum(
  ['IGUAL_TEXTO', 'IGUAL_NÚMERICO', 'MAIOR_QUE_NÚMERICO', 'MENOR_QUE_NÚMERICO', 'INTERVALO_NÚMERICO', 'INCLUI_LISTA'],
  {
    required_error: 'Tipo de condicional não informado.',
    invalid_type_error: 'Tipo não válido para tipo de condicional.',
  }
)
export type TProcessAutomationConditionType = z.infer<typeof ProcessAutomationConditionTypes>

type TProcessAutomationConditionTypesOption = {
  id: number
  label: string
  value: TProcessAutomationConditionType
}
export const ProcessAutomationConditionTypesOptions: TProcessAutomationConditionTypesOption[] = [
  { id: 1, label: 'IGUALDADE DE TEXTO', value: 'IGUAL_TEXTO' },
  { id: 2, label: 'IGUALDADE NÚMERICA', value: 'IGUAL_NÚMERICO' },
  { id: 3, label: 'MAIOR QUE', value: 'MAIOR_QUE_NÚMERICO' },
  { id: 4, label: 'MENOR QUE', value: 'MENOR_QUE_NÚMERICO' },
  { id: 5, label: 'INVERVALO NÚMERICO', value: 'INTERVALO_NÚMERICO' },
  { id: 6, label: 'INCLUSO EM LISTA', value: 'INCLUI_LISTA' },
]
type TriggerCondition = {
  label: string
  value: string // Definir dados para condicional
  types: TProcessAutomationConditionType[]
}

export const ProcessAutomationEntities = z.enum(['Project', 'Revenue', 'Expense', 'Purchase', 'Homologation', 'ServiceOrder', 'Activity', 'Notification'])
export type TProcessAutomationEntities = z.infer<typeof ProcessAutomationEntities>
export type TProcessAutomationEntitySpec = {
  entity: TProcessAutomationEntities
  entityLabel: string
  triggerConditions: TriggerCondition[]
  returnable: boolean
}

export const ProcessAutomationEntitiesSpecs: TProcessAutomationEntitySpec[] = [
  {
    entity: 'Project',
    entityLabel: 'PROJETO',
    triggerConditions: processAutomationConditionAlias.filter((c) => c.entity == 'Project'),
    returnable: false,
  },
  {
    entity: 'Revenue',
    entityLabel: 'RECEITA',
    triggerConditions: processAutomationConditionAlias.filter((c) => c.entity == 'Revenue'),
    returnable: true,
  },
  {
    entity: 'Purchase',
    entityLabel: 'COMPRA',
    triggerConditions: processAutomationConditionAlias.filter((c) => c.entity == 'Purchase'),
    returnable: true,
  },
  {
    entity: 'ServiceOrder',
    entityLabel: 'ORDEM DE SERVIÇO',
    triggerConditions: processAutomationConditionAlias.filter((c) => c.entity == 'ServiceOrder'),
    returnable: true,
  },
  {
    entity: 'Activity',
    entityLabel: 'ATIVIDADE',
    triggerConditions: processAutomationConditionAlias.filter((c) => c.entity == 'Activity'),
    returnable: true,
  },
  {
    entity: 'Notification',
    entityLabel: 'NOTIFICAÇÃO',
    triggerConditions: [],
    returnable: true,
  },
]
