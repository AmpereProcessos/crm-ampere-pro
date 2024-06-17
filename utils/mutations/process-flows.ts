import axios from 'axios'
import { TProcessFlow } from '../schemas/process-flow.schema'

export async function createProcessFlow({ info }: { info: TProcessFlow }) {
  try {
    const { data } = await axios.post('/api/process-flows', info)
    if (typeof data.message != 'string') return 'Fluxo de processos criado com sucesso !'

    return data.message as string
  } catch (error) {
    throw error
  }
}

export async function editProcessFlow({ id, changes }: { id: string; changes: Partial<TProcessFlow> }) {
  try {
    const { data } = await axios.put(`/api/process-flows?id=${id}`, changes)
    if (typeof data.message != 'string') return 'Fluxo de processos alterado com sucesso !'
    return data.message as string
  } catch (error) {
    throw error
  }
}
