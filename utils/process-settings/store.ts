import { nanoid } from 'nanoid'
import { applyEdgeChanges, applyNodeChanges, Edge, EdgeAddChange, EdgeChange, Node, NodeChange } from 'reactflow'
import { create } from 'zustand'
import { TProjectTypeProcessSetting } from '../schemas/project-type-process-settings'
import { getActiveProcessAutomationReference, TProcessAutomationEntities } from '.'
import ProjectNode from '@/components/ReactFlowTesting/ProjectNode'
import RevenueNode from '@/components/ReactFlowTesting/RevenueNode'
import ActivityNode from '@/components/ReactFlowTesting/ActivityNode'
import PurchaseNode from '@/components/ReactFlowTesting/PurchaseNode'
import ServiceOrderNode from '@/components/ReactFlowTesting/ServiceOrderNode'
import NotificationNode from '@/components/ReactFlowTesting/NotificationNode'
import { TIndividualProcess } from '../schemas/process-flow.schema'
import ComissionNode from '@/components/ReactFlowTesting/ComissionNode'

export type TProcessSettingNode = Node<TIndividualProcess>

type TNodeTypeMap = {
  [key in TProcessAutomationEntities]: string
}
const NodeTypeMap: TNodeTypeMap = {
  Project: 'project',
  Revenue: 'revenue',
  Expense: 'expense',
  Comission: 'comission',
  Purchase: 'purchase',
  Homologation: 'homologation',
  ServiceOrder: 'serviceorder',
  Activity: 'activity',
  Notification: 'notification',
}
export const nodeTypes = {
  project: ProjectNode,
  revenue: RevenueNode,
  comission: ComissionNode,
  activity: ActivityNode,
  purchase: PurchaseNode,
  serviceorder: ServiceOrderNode,
  notification: NotificationNode,
}

export const useProjectSettingStore = create((set: any, get: any) => ({
  name: '',
  description: '',
  nodes: [
    {
      id: nanoid(6),
      data: {
        id: nanoid(),
        entidade: {
          identificacao: 'Project',
          customizacao: {},
        },
        ativacao: {
          referencia: { identificacao: 'Project' },
          gatilho: {
            tipo: getActiveProcessAutomationReference('Project').triggerConditions[0]?.types[0] || null,
            variavel: '',
          },
        },
        canvas: {},
      },
      type: 'project',
      position: { x: 0.5, y: 0.5 },
    },
  ] as TProcessSettingNode[],
  edges: [] as Edge[],
  updateName(newName: string) {
    set({ name: newName })
  },
  updateDescription(newDescription: string) {
    set({ description: newDescription })
  },
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
  setNodesDirectly(nodes: TProcessSettingNode[]) {
    set({ nodes })
  },
  addEdge(data: any) {
    const id = nanoid(6)
    const edge = { id, ...data }
    set({ edges: [edge, ...get().edges] })
  },
  updateNodeData(nodeId: string, data: TIndividualProcess) {
    set({
      nodes: get().nodes.map((node: TProcessSettingNode) => {
        if (node.id === nodeId) {
          // it's important to create a new object here, to inform React Flow about the changes
          node.data = { ...node.data, ...data }
        }

        return node
      }),
    })
  },
  addNode({ parentNode, newNode }: { parentNode: TProcessSettingNode | null; newNode: TProcessSettingNode }) {
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
}))
