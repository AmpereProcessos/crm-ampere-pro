import ProcessFlowReferences from '@/components/Project/ProcessFlowReferences'
import ProcessFlowSelectionMenu from '@/components/Project/Utils/ProcessFlowSelectionMenu'
import { useProcessFlowReferencesByProjectId } from '@/utils/queries/process-flow-references'
import React from 'react'

type ProjectProcessFlowBlockProps = {
  projectId: string
}
function ProjectProcessFlowBlock({ projectId }: ProjectProcessFlowBlockProps) {
  const { data: flowReferences, isLoading, isError, isSuccess } = useProcessFlowReferencesByProjectId({ projectId })
  if (isLoading) return null
  if (isError) return null
  if (isSuccess)
    return (
      <>
        {flowReferences && flowReferences?.length > 0 ? (
          <ProcessFlowReferences flowReferences={flowReferences} />
        ) : (
          <ProcessFlowSelectionMenu projectId={projectId} />
        )}
      </>
    )
  return <></>
}

export default ProjectProcessFlowBlock
