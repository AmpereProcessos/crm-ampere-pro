import axios from 'axios'
import { TProcessFlowReferenceDTO } from '../schemas/process-flow-reference.schema'
import { useQuery } from '@tanstack/react-query'

async function fetchProcessFlowReferencesByProjectId({ projectId }: { projectId: string }) {
  try {
    const { data } = await axios.get(`/api/process-flows/references?projectId=${projectId}`)
    return data.data as TProcessFlowReferenceDTO[]
  } catch (error) {}
}

export function useProcessFlowReferencesByProjectId({ projectId }: { projectId: string }) {
  return useQuery({
    queryKey: ['process-flow-references-by-project-id', projectId],
    queryFn: async () => await fetchProcessFlowReferencesByProjectId({ projectId }),
  })
}
