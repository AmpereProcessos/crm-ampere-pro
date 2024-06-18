import { nodeTypes, TProcessSettingNode, useProjectSettingStore } from '@/utils/process-settings/store'
import { TProcessFlowDTO } from '@/utils/schemas/process-flow.schema'
import React, { useEffect } from 'react'
import ReactFlow, { Background, Controls } from 'reactflow'
import 'reactflow/dist/style.css'

type ProcessFlowSelectionSettingProps = {
  flow: TProcessFlowDTO
}
function ProcessFlowSelectionSetting({ flow }: ProcessFlowSelectionSettingProps) {
  const store = useProjectSettingStore()

  useEffect(() => {
    const nodes: TProcessSettingNode[] = flow.processos.map((p) => ({
      id: p.canvas.id || '',
      data: {
        id: p.id,
        referencia: p.referencia,
        customizacao: p.customizacao,
        gatilho: p.gatilho,
        retorno: p.retorno,
        canvas: p.canvas,
        idProcessoPai: p.idProcessoPai,
      },
      position: { x: p.canvas.posX || 0, y: p.canvas.posY || 0 },
      type: p.referencia.entidade.toLowerCase(),
    }))
    const edges = flow.arestas
    store.setNodesDirectly(nodes)
    store.setEdgesDirectly(edges)
  }, [flow])
  console.log('EDGES', store.edges)
  console.log('NODES', store.nodes)
  return (
    <div className="flex h-[500px] w-full flex-col rounded border border-gray-500 p-2">
      <ReactFlow
        nodes={store.nodes}
        edges={store.edges}
        nodeTypes={nodeTypes}
        onNodesChange={store.onNodesChange}
        onEdgesChange={store.onEdgesChange}
        onConnect={store.addEdge}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  )
}

export default ProcessFlowSelectionSetting
