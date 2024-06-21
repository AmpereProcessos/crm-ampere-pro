import { z } from 'zod'
import { processAutomationConditionAlias } from './helpers'
import { TProcessFlowReference } from '../schemas/process-flow-reference.schema'
import { applyEdgeChanges, applyNodeChanges, Edge, EdgeChange, Node } from 'reactflow'
import { create } from 'zustand'
import { nanoid } from 'nanoid'

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

export const ProcessAutomationEntities = z.enum([
  'Project',
  'Revenue',
  'Expense',
  'Purchase',
  'Comission',
  'Homologation',
  'ServiceOrder',
  'Activity',
  'Notification',
])
export type TProcessAutomationEntities = z.infer<typeof ProcessAutomationEntities>
export type TProcessAutomationEntitySpec = {
  entity: TProcessAutomationEntities
  entityLabel: string
  description: string
  triggerConditions: TriggerCondition[]
  returnable: boolean
  returnableEntities: TProcessAutomationEntities[]
  customizable: boolean
  returns: boolean
}

export const ProcessAutomationEntitiesSpecs: TProcessAutomationEntitySpec[] = [
  {
    entity: 'Project',
    entityLabel: 'PROJETO',
    description: '',
    triggerConditions: processAutomationConditionAlias.filter((c) => c.entity == 'Project'),
    returnable: false,
    returnableEntities: ['Activity', 'Notification', 'Revenue', 'Comission', 'Purchase', 'ServiceOrder'],
    customizable: false,
    returns: true,
  },
  {
    entity: 'Revenue',
    entityLabel: 'RECEITA',
    description: 'Esse processo cria uma receita de forma automática utilizando informações do projeto',
    triggerConditions: processAutomationConditionAlias.filter((c) => c.entity == 'Revenue'),
    returnable: true,
    returnableEntities: ['Activity', 'Notification', 'Revenue', 'Comission', 'Purchase', 'ServiceOrder'],
    customizable: false,
    returns: true,
  },
  {
    entity: 'Comission',
    entityLabel: 'COMISSÃO',
    description: 'Esse processo cria registros de comissão de forma automática utilizando informações dos responsáveis do projeto',
    triggerConditions: processAutomationConditionAlias.filter((c) => c.entity == 'Comission'),
    returnableEntities: [],
    returnable: true,
    customizable: false,
    returns: false,
  },
  {
    entity: 'Purchase',
    entityLabel: 'COMPRA',
    description: 'Esse processo cria um controle de compra de forma automática utilizando informações dos itens de venda do projeto',
    triggerConditions: processAutomationConditionAlias.filter((c) => c.entity == 'Purchase'),
    returnable: true,
    returnableEntities: ['Activity', 'Notification', 'Revenue', 'Comission', 'Purchase', 'ServiceOrder'],
    customizable: false,
    returns: true,
  },
  {
    entity: 'ServiceOrder',
    entityLabel: 'ORDEM DE SERVIÇO',
    description: 'Esse processo cria uma ordem de serviço de forma automática utilizando informações do projeto e/ou customizáveis.',
    triggerConditions: processAutomationConditionAlias.filter((c) => c.entity == 'ServiceOrder'),
    returnable: true,
    returnableEntities: ['Activity', 'Notification', 'Revenue', 'Comission', 'Purchase', 'ServiceOrder'],
    customizable: false,
    returns: true,
  },
  {
    entity: 'Activity',
    entityLabel: 'ATIVIDADE',
    description: 'Esse processo cria uma atividade de forma automática utilizando informações do projeto e/ou customizáveis.',
    triggerConditions: processAutomationConditionAlias.filter((c) => c.entity == 'Activity'),
    returnable: true,
    returnableEntities: ['Activity', 'Notification', 'Revenue', 'Comission', 'Purchase', 'ServiceOrder'],
    customizable: true,
    returns: true,
  },
  {
    entity: 'Notification',
    entityLabel: 'NOTIFICAÇÃO',
    description: 'Esse processo cria um notificação de forma automática utilizando informações do projeto e/ou customizáveis.',
    triggerConditions: [],
    returnable: true,
    returnableEntities: [],
    customizable: true,
    returns: false,
  },
]
export function getEntityLabel(entity: TProcessAutomationEntities) {
  const entitySpecs = ProcessAutomationEntitiesSpecs.find((p) => p.entity == entity)
  return entitySpecs?.entityLabel || 'NÃO DEFINIDO'
}
export function getActiveProcessAutomationReference(referenceEntity?: TProcessAutomationEntities) {
  if (!referenceEntity) return ProcessAutomationEntitiesSpecs[0]
  const entitySpecs = ProcessAutomationEntitiesSpecs.find((p) => p.entity == referenceEntity)
  if (!entitySpecs) return ProcessAutomationEntitiesSpecs[0]
  return entitySpecs
}
export function getProcessAutomationComparationMethods({ entity, variable }: { entity: TProcessAutomationEntitySpec; variable: string }) {
  const types = entity.triggerConditions.find((c) => c.value == variable)
  if (!types) return []
  return types.types.map((t, index) => {
    const typeLabel = ProcessAutomationConditionTypesOptions.find((o) => o.value == t)?.label
    return { id: index + 1, label: typeLabel || 'NÃO DEFINIDO', value: t }
  })
}

export type TProcessFlowReferenceNode = Node<TProcessFlowReference>

export const useProjectProcessFlowReferencesStore = create((set: any, get: any) => ({
  nodes: [] as TProcessFlowReferenceNode[],
  edges: [] as Edge[],
  onNodesChange(changes: any) {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    })
  },
  onEdgesChange(changes: EdgeChange[]) {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    })
  },
  setEdgesDirectly(edges: Edge[]) {
    set({ edges })
  },
  setNodesDirectly(nodes: TProcessFlowReferenceNode[]) {
    set({ nodes })
  },
  addEdge(data: any) {
    const id = nanoid(6)
    const edge = { id, ...data }
    set({ edges: [edge, ...get().edges] })
  },
  addNode({ parentNode, newNode }: { parentNode: TProcessFlowReferenceNode | null; newNode: TProcessFlowReferenceNode }) {
    if (!!parentNode) {
      const newEdge = {
        id: nanoid(6),
        source: parentNode.id,
        target: newNode.id,
      }
      set({
        nodes: [...get().nodes, newNode],
        edges: [...get().edges, newEdge],
      })
    } else {
      set({
        nodes: [...get().nodes, newNode],
      })
    }
  },
  updateNodeData(nodeId: string, data: TProcessFlowReference) {
    set({
      nodes: get().nodes.map((node: TProcessFlowReferenceNode) => {
        if (node.id === nodeId) {
          // it's important to create a new object here, to inform React Flow about the changes
          node.data = { ...node.data, ...data }
        }

        return node
      }),
    })
  },
}))
