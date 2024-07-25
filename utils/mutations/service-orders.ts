import axios from 'axios'
import { TServiceOrder } from '../schemas/service-order.schema'

export async function createServiceOrder({ info }: { info: TServiceOrder }) {
  try {
    const { data } = await axios.post('/api/service-orders', info)

    if (typeof data.message != 'string') return 'Ordem de serviço criada com sucesso !'
    return data.message as string
  } catch (error) {
    throw error
  }
}
export async function editServiceOrder({ id, changes }: { id: string; changes: Partial<TServiceOrder> }) {
  try {
    const { data } = await axios.put(`/api/service-orders?id=${id}`, changes)

    if (typeof data.message != 'string') return 'Ordem de serviço atualizada com sucesso !'
    return data.message as string
  } catch (error) {
    throw error
  }
}
export async function editServiceOrderPersonalized({ id, changes }: { id: string; changes: any }) {
  try {
    const { data } = await axios.put(`/api/service-orders/personalized?id=${id}`, changes)

    if (typeof data.message != 'string') return 'Ordem de serviço atualizada com sucesso !'
    return data.message as string
  } catch (error) {
    throw error
  }
}
