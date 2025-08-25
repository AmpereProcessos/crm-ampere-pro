import { getActiveProcessAutomationReference, getEntityLabel } from '@/utils/process-settings'
import { TProcessSettingNode, useProjectSettingStore } from '@/utils/process-settings/store'
import { nanoid } from 'nanoid'
import React from 'react'

function ReturnDependentProcessBlock(node: TProcessSettingNode) {
  const { id, data } = node
  const addNode = useProjectSettingStore((x) => x.addNode)
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
              addNode({
                parentNode: node,
                newNode: {
                  id: nanoid(6),
                  data: {
                    id: nanoid(),
                    idProcessoPai: node.data.id,
                    entidade: {
                      identificacao: p,
                      customizacao: {},
                    },
                    ativacao: {
                      referencia: { identificacao: entityReference.entity },
                      gatilho: {
                        tipo: getActiveProcessAutomationReference(entityReference.entity).triggerConditions[0]?.types[0] || null,
                        variavel: getActiveProcessAutomationReference(entityReference.entity).triggerConditions[0]?.value || '',
                      },
                    },
                    canvas: {},
                  },
                  type: p.toLowerCase(),
                  position: newPosition,
                },
              })
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

export default ReturnDependentProcessBlock
