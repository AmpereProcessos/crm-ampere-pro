import { getActiveProcessAutomationReference } from '@/utils/process-settings'
import { TProcessSettingNode } from '@/utils/process-settings/store'
import { TIndividualProcess } from '@/utils/schemas/process-flow.schema'
import React from 'react'
import { NodeProps } from 'reactflow'
import Activity from '../CustomizationBlocks/Activity'
import Notification from '../CustomizationBlocks/Notification'

function CustomizationBlock(node: TProcessSettingNode) {
  const { id, data } = node
  const activeAutomationReference = getActiveProcessAutomationReference(data.referencia.entidade)

  return (
    <div className="flex w-full flex-col gap-2 rounded border border-gray-500">
      <h1 className="w-full rounded bg-gray-800 p-1 text-center text-xs font-bold text-white">CUSTOMIZAÇÃO</h1>
      <div className="flex w-full flex-col gap-2 p-2">
        {activeAutomationReference.customizable ? (
          <>
            {node.data.referencia.entidade == 'Activity' ? <Activity {...node} /> : null}
            {node.data.referencia.entidade == 'Notification' ? <Notification {...node} /> : null}
          </>
        ) : (
          <h1 className="w-full max-w-full break-words rounded border border-gray-500 bg-gray-50 p-1 text-center text-[0.65rem] tracking-tight text-gray-500">
            ESSA ENTIDADE NÃO É CUSTOMIZÁVEL E SUAS INFORMAÇÕES SÃO OBTIDAS POR PADRÃO.
          </h1>
        )}
      </div>
    </div>
  )
}

export default CustomizationBlock
