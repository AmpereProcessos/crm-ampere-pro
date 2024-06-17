import { TProjectTypeProcessSetting } from '@/utils/schemas/project-type-process-settings'
import React from 'react'
import { NodeProps } from 'reactflow'
import ProjectNode from './ProjectNode'
import { TIndividualProcess } from '@/utils/schemas/process-flow.schema'

type GeneralNodeProps = TIndividualProcess

function GeneralNode({ id, data, ...otherProps }: NodeProps<GeneralNodeProps>) {
  return <>{data.referencia.entidade == 'Project' ? <ProjectNode id={id} data={data} {...otherProps} /> : null}</>
}

export default GeneralNode
