import { getActiveProcessAutomationReference, getProcessAutomationComparationMethods, ProcessAutomationEntitiesSpecs } from '@/utils/process-settings'
import { getProcessAutomationConditionOptions, TProcessAutomationConditionData } from '@/utils/process-settings/helpers'
import { useProjectSettingStore } from '@/utils/process-settings/store'
import { TProjectTypeProcessSetting } from '@/utils/schemas/project-type-process-settings'
import React from 'react'
import { MdDashboard } from 'react-icons/md'
import { Handle, NodeProps, Position } from 'reactflow'
import SelectInput from '../Inputs/SelectInput'
import NumberInput from '../Inputs/NumberInput'
import MultipleSelectInput from '../Inputs/MultipleSelectInput'
import TriggerBlock from './ProcessSettingBlocks/TriggerBlock'
import ReturnBlock from './ProcessSettingBlocks/ReturnBlock'
import { BsCartFill } from 'react-icons/bs'
import { TIndividualProcess } from '@/utils/schemas/process-flow.schema'
import ReturnConfigurationBlock from './ProcessSettingBlocks/ReturnConfigurationBlock'
import CustomizationBlock from './ProcessSettingBlocks/CustomizationBlock'

function PurchaseNode(node: NodeProps<TIndividualProcess>) {
  const { id, data } = node
  return (
    <>
      <Handle type="target" position={Position.Top} id="purchase-target" />
      <div className="flex min-w-[700px] max-w-[700px] flex-col gap-2 rounded border border-gray-500 bg-[#fff] p-6 ">
        <div className="flex items-center gap-1">
          <div className="flex h-[35px] w-[35px] items-center justify-center rounded-full border border-black p-1">
            <BsCartFill />
          </div>
          <h1 className="text-xl font-black leading-none tracking-tight">COMPRA</h1>
        </div>
        <ReturnConfigurationBlock position={{ x: node.xPos, y: node.yPos }} {...node} />
      </div>
      <Handle type="source" position={Position.Bottom} id="purchase-source" />
    </>
  )
}

export default PurchaseNode
