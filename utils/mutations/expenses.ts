import axios from 'axios'
import { TExpense } from '../schemas/expenses.schema'

export async function createExpense({ info }: { info: TExpense }) {
  try {
    const { data } = await axios.post('/api/expenses', info)
    if (typeof data.message != 'string') return 'Despesa adicionada com sucesso !'
    return data.message as string
  } catch (error) {
    throw error
  }
}

export async function editExpense({ id, changes }: { id: string; changes: Partial<TExpense> }) {
  try {
    const { data } = await axios.put(`/api/expenses?id=${id}`, changes)
    if (typeof data.message != 'string') return 'Despesa atualizada com sucesso!'
    return data.message as string
  } catch (error) {
    throw error
  }
}

export async function editExpensePersonalized({ id, changes }: { id: string; changes: any }) {
  try {
    const { data } = await axios.put(`/api/expenses/personalized?id=${id}`, changes)
    if (typeof data.message != 'string') return 'Despesa atualizada com sucesso!'
    return data.message as string
  } catch (error) {
    throw error
  }
}
