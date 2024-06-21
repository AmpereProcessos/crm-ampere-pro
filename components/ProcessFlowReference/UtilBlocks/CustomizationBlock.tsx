import { getActiveProcessAutomationReference, TProcessFlowReferenceNode } from '@/utils/process-settings'
import React from 'react'
import Activity from './Customization/Activity'

function CustomizationBlock(node: TProcessFlowReferenceNode) {
  const { id, data } = node
  const activeAutomationReference = getActiveProcessAutomationReference(data.entidade.identificacao)
  return (
    <div className="flex w-full flex-col gap-2">
      <h1 className="w-full rounded p-1 text-center text-xs font-bold text-blue-500">CUSTOMIZAÇÃO</h1>
      <div className="flex w-full flex-col gap-2 p-2">
        {activeAutomationReference.customizable ? (
          <>
            {node.data.entidade.identificacao == 'Activity' ? <Activity {...node} /> : null}
            {/* {node.data.entidade.identificacao == 'Notification' ? <Notification {...node} /> : null} */}
          </>
        ) : (
          <h1 className="w-full max-w-full break-words rounded border border-gray-500 bg-gray-50 p-1 text-center text-[0.65rem] tracking-tight text-gray-500">
            ESSA ENTIDADE DE RETORNO NÃO É CUSTOMIZÁVEL E SUAS INFORMAÇÕES SÃO OBTIDAS POR PADRÃO.
          </h1>
        )}
      </div>
    </div>
  )
}

export default CustomizationBlock
