import { getActiveProcessAutomationReference, getProcessAutomationComparationMethods, ProcessAutomationEntitiesSpecs } from '@/utils/process-settings'
import { getProcessAutomationConditionOptions, TProcessAutomationConditionData } from '@/utils/process-settings/helpers'
import { useProjectSettingStore } from '@/utils/process-settings/store'
import { TProjectTypeProcessSetting } from '@/utils/schemas/project-type-process-settings'
import React from 'react'
import { MdDashboard, MdNotifications } from 'react-icons/md'
import { Handle, NodeProps, Position } from 'reactflow'
import SelectInput from '../Inputs/SelectInput'
import NumberInput from '../Inputs/NumberInput'
import MultipleSelectInput from '../Inputs/MultipleSelectInput'
import TriggerBlock from './ProcessSettingBlocks/TriggerBlock'
import ReturnBlock from './ProcessSettingBlocks/ReturnBlock'
import { BsCartFill } from 'react-icons/bs'
import { TIndividualProcess } from '@/utils/schemas/process-flow.schema'
import CustomizationBlock from './ProcessSettingBlocks/CustomizationBlock'
import ReturnConfigurationBlock from './ProcessSettingBlocks/ReturnConfigurationBlock'
import { FaPercentage } from 'react-icons/fa'
import ActivationBlock from './ProcessSettingBlocks/ActivationBlock'
import ReturnDependentProcessBlock from './ProcessSettingBlocks/ReturnDependentProcessBlock'

function ComissionNode(node: NodeProps<TIndividualProcess>) {
  const { id, data } = node
  const entityReference = getActiveProcessAutomationReference(data.entidade.identificacao)
  return (
    <>
      <Handle type="target" position={Position.Top} id="notification-target" />
      <div className="flex min-w-[700px] max-w-[700px] flex-col gap-2 rounded border border-gray-500 bg-[#fff] p-6 ">
        <div className="flex items-center gap-1">
          <div className="flex h-[35px] w-[35px] items-center justify-center rounded-full border border-black p-1">
            <FaPercentage />
          </div>
          <h1 className="text-xl font-black leading-none tracking-tight">COMISSÃO</h1>
        </div>
        <p className="w-full text-center text-xs tracking-tight">{entityReference.description}</p>
        <CustomizationBlock position={{ x: node.xPos, y: node.yPos }} {...node} />
        <ActivationBlock position={{ x: node.xPos, y: node.yPos }} {...node} />
        <ReturnDependentProcessBlock position={{ x: node.xPos, y: node.yPos }} {...node} />
      </div>
    </>
  )
}

export default ComissionNode
