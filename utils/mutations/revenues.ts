import axios from 'axios'
import { TRevenue } from '../schemas/revenues.schema'

export async function createRevenue({ info }: { info: TRevenue }) {
  try {
    const { data } = await axios.post('/api/revenues', info)
    if (typeof data.message != 'string') return 'Receita adicionada com sucesso !'
    return data.message as string
  } catch (error) {
    throw error
  }
}

export async function editRevenue({ id, changes }: { id: string; changes: Partial<TRevenue> }) {
  try {
    const { data } = await axios.put(`/api/revenues?id=${id}`, changes)
    if (typeof data.message != 'string') return 'Receita atualizada com sucesso!'
    return data.message as string
  } catch (error) {
    throw error
  }
}
