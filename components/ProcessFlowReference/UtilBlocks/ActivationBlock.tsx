import { TProcessFlowReferenceNode } from '@/utils/process-settings'
import React from 'react'
import TriggerBlock from './TriggerBlock'

function ActivationBlock(node: TProcessFlowReferenceNode) {
  const { id, data } = node
  return (
    <div className="flex w-full flex-col gap-2 rounded border border-gray-500">
      <h1 className="w-full rounded bg-gray-800 p-1 text-center text-xs font-bold text-white">CONFIGURAÇÃO DE ATIVAÇÃO</h1>
      <div className="flex w-full flex-col gap-2 p-2">
        <p className="w-full text-center text-[0.65rem] text-gray-500">
          Configure aqui os parâmetros que ativarão a entidade dessa etapa do processo. Os gatilhos disponíveis utilizam características da entidade do processo
          pai.
        </p>
        <TriggerBlock {...node} />
      </div>
    </div>
  )
}

export default ActivationBlock
