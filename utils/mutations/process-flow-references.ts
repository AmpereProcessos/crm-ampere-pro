import axios from 'axios'
import { TIndividualProcess } from '../schemas/process-flow.schema'

type CreateManyProcessFlowReferencesParams = {
  individualProcess: TIndividualProcess[]
  projectId: string
}
export async function createManyProcessFlowReferences({ individualProcess, projectId }: CreateManyProcessFlowReferencesParams) {
  try {
    const { data } = await axios.post('/api/process-flows/references/many', { individualProcess, projectId })
    if (typeof data.message != 'string') return 'Referências de fluxo de processo criadas com sucesso!'

    return data.message as string
  } catch (error) {
    throw error
  }
}
