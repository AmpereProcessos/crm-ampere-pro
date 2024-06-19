import CheckboxInput from '@/components/Inputs/CheckboxInput'
import { getActiveProcessAutomationReference } from '@/utils/process-settings'
import { TProcessSettingNode, useProjectSettingStore } from '@/utils/process-settings/store'
import React from 'react'
import TriggerBlock from './TriggerBlock'
import ReturnBlock from './ReturnBlock'
import { nanoid } from 'nanoid'

function ReturnConfigurationBlock(node: TProcessSettingNode) {
  const { id, data } = node
  const activeAutomationReference = getActiveProcessAutomationReference(data.referencia.entidade)
  const [updateNodeData, addNode] = useProjectSettingStore((state) => [state.updateNodeData, state.addNode])
  return (
    <div className="flex w-full flex-col gap-2 rounded border border-gray-500">
      <h1 className="w-full rounded bg-gray-800 p-1 text-center text-xs font-bold text-white">CONFIGURAÇÃO DE RETORNO</h1>
      <div className="flex w-full flex-col gap-2 p-2">
        {activeAutomationReference.returns ? (
          <>
            <div className="flex w-full items-center justify-center">
              <div draggable={false} className="w-fit">
                <CheckboxInput
                  labelFalse="CONFIGURAR PROCESSO DEPENDENTE"
                  labelTrue="CONFIGURAR PROCESSO DEPENDENTE"
                  checked={!!data.retorno.entidade}
                  handleChange={(value) => {
                    console.log(value)
                    if (!!value) updateNodeData(id, { ...data, retorno: { ...data.retorno, entidade: 'Activity' } })
                    else updateNodeData(id, { ...data, retorno: { ...data.retorno, entidade: null } })
                  }}
                />
              </div>
            </div>
            {!!data.retorno.entidade ? (
              <>
                <TriggerBlock {...node} />
                <ReturnBlock {...node} />
                <div className="mt-4 flex w-full items-center justify-end">
                  <button
                    onClick={() => {
                      const newPosition = { x: node.position.x, y: node.position.y + 800 }
                      addNode({
                        parentNode: node,
                        newNode: {
                          id: nanoid(6),
                          data: {
                            id: nanoid(),
                            idProcessoPai: node.data.id,
                            referencia: {
                              entidade: data.retorno.entidade || 'Activity',
                            },
                            gatilho: {
                              tipo: getActiveProcessAutomationReference(data.retorno.entidade || undefined).triggerConditions[0]?.types[0] || null,
                              variavel: getActiveProcessAutomationReference(data.retorno.entidade || undefined).triggerConditions[0]?.value || '',
                            },
                            retorno: {
                              entidade: 'Activity',
                              customizacao: {},
                            },
                            canvas: {},
                          },
                          type: data.retorno.entidade?.toLowerCase(),
                          position: newPosition,
                        },
                      })
                    }}
                    className="h-9 whitespace-nowrap rounded bg-green-700 px-2 py-1 text-xs font-medium text-white shadow disabled:bg-gray-500 disabled:text-white enabled:hover:bg-green-600 enabled:hover:text-white"
                  >
                    ADICIONAR PROCESSO DEPENDENTE
                  </button>
                </div>
              </>
            ) : null}
          </>
        ) : (
          <h1 className="w-full max-w-full break-words rounded border border-gray-500 bg-gray-50 p-1 text-center text-[0.65rem] tracking-tight text-gray-500">
            ESSA ENTIDADE NÃO PERMITE PROCESSOS DEPENDENTES.
          </h1>
        )}
      </div>
    </div>
  )
}

export default ReturnConfigurationBlock
