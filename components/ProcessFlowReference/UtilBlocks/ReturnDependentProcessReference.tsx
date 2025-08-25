import { getActiveProcessAutomationReference, getEntityLabel, TProcessFlowReferenceNode, useProjectProcessFlowReferencesStore } from '@/utils/process-settings'
import { nanoid } from 'nanoid'
import React from 'react'

function ReturnDependentProcessReference(node: TProcessFlowReferenceNode) {
  const { id, data } = node
  const addNode = useProjectProcessFlowReferencesStore((x) => x.addNode)
  const entityReference = getActiveProcessAutomationReference(data.entidade.identificacao)
  if (entityReference.returnableEntities.length == 0) return null
  return (
    <div className="flex w-full flex-col gap-2">
      <h1 className="w-full rounded-sm p-1 text-center text-xs font-bold text-blue-500">ADIÇÃO DE PROCESSO DEPENDENTE</h1>
      <div className="flex w-full flex-col">
        <p className="w-full text-center text-xs leading-none tracking-tight">Crie uma nova etapa de processo.</p>
        <p className="w-full text-center text-xs leading-none tracking-tight">Os parâmetros de ativação da próxima etapa serão baseados nesse processo.</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {entityReference.returnableEntities.map((p, index) => (
          <button
            key={index}
            onClick={() => {
              const newPosition = { x: node.position.x, y: node.position.y + 800 }
              // TODO
              // Create function and api endpoints to create new process flow reference on this button click
            }}
            className={`grow rounded-sm border border-green-700 p-1  text-xs font-medium text-green-500  duration-300 ease-in-out hover:bg-green-700  hover:text-white`}
          >
            {getEntityLabel(p)}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ReturnDependentProcessReference
