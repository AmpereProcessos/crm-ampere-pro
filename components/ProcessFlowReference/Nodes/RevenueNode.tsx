import ReturnDependentProcessBlock from '@/components/ReactFlowTesting/ProcessSettingBlocks/ReturnDependentProcessBlock'
import { getActiveProcessAutomationReference } from '@/utils/process-settings'
import { TProcessFlowReference } from '@/utils/schemas/process-flow-reference.schema'
import React from 'react'
import { MdAttachMoney } from 'react-icons/md'
import { Handle, NodeProps, Position } from 'reactflow'
import ReturnDependentProcessReference from '../UtilBlocks/ReturnDependentProcessReference'
import ActivationBlock from '../UtilBlocks/ActivationBlock'
import CustomizationBlock from '../UtilBlocks/CustomizationBlock'

function RevenueNode(node: NodeProps<TProcessFlowReference>) {
  const { id, data } = node
  const entityReference = getActiveProcessAutomationReference(data.entidade.identificacao)
  return (
    <>
      <Handle type="target" position={Position.Top} id="revenue-target" />
      <div className="flex min-w-[700px] max-w-[700px] flex-col gap-2 rounded border border-gray-500 bg-[#fff] p-6 ">
        <div className="flex items-center gap-1">
          <div className="flex h-[35px] w-[35px] items-center justify-center rounded-full border border-black p-1">
            <MdAttachMoney />
          </div>
          <h1 className="text-xl font-black leading-none tracking-tight">RECEITA</h1>
        </div>
        <p className="w-full text-center text-xs tracking-tight">{entityReference.description}</p>
        <CustomizationBlock position={{ x: node.xPos, y: node.yPos }} {...node} />
        <ActivationBlock position={{ x: node.xPos, y: node.yPos }} {...node} />
        <ReturnDependentProcessReference position={{ x: node.xPos, y: node.yPos }} {...node} />
      </div>
      <Handle type="source" position={Position.Bottom} id="revenue-source" />
    </>
  )
}

export default RevenueNode
