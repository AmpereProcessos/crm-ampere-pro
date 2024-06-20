import { getActiveProcessAutomationReference } from '@/utils/process-settings'
import { TProcessSettingNode } from '@/utils/process-settings/store'
import React from 'react'

function ActivationBlock(node: TProcessSettingNode) {
  const { id, data } = node
  const activationAutomationReference = getActiveProcessAutomationReference(data.ativacao.referencia.identificacao)
  return (
    <div className="flex w-full flex-col gap-2 rounded border border-gray-500">
      <h1 className="w-full rounded bg-gray-800 p-1 text-center text-xs font-bold text-white">CONFIGURAÇÃO DE ATIVAÇÃO</h1>
      <div className="flex w-full flex-col gap-2 p-2"></div>
    </div>
  )
}

export default ActivationBlock
