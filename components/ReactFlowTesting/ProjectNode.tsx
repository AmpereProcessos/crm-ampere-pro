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
import { TIndividualProcess } from '@/utils/schemas/process-flow.schema'
import CustomizationBlock from './ProcessSettingBlocks/CustomizationBlock'
import ReturnConfigurationBlock from './ProcessSettingBlocks/ReturnConfigurationBlock'

function ProjectNode(node: NodeProps<TIndividualProcess>) {
  const { id, data } = node
  const updateNodeData = useProjectSettingStore((state) => state.updateNodeData)
  const activeAutomationReference = getActiveProcessAutomationReference(data.referencia.entidade)
  return (
    <>
      <div className="flex min-w-[700px] max-w-[700px] flex-col gap-2 rounded border border-gray-500 bg-[#fff] p-6 ">
        <div className="flex items-center gap-1">
          <div className="flex h-[35px] w-[35px] items-center justify-center rounded-full border border-black p-1">
            <MdDashboard />
          </div>
          <h1 className="text-xl font-black leading-none tracking-tight">PROJETO</h1>
        </div>
        <ReturnConfigurationBlock position={{ x: node.xPos, y: node.yPos }} {...node} />
      </div>
      <Handle type="source" position={Position.Bottom} id="project-source" />
    </>
  )
}

export default ProjectNode
