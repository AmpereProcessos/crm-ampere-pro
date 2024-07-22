import axios from 'axios'
import { TServiceOrderDTO, TServiceOrderWithProjectDTO } from '../schemas/service-order.schema'
import { useQuery } from '@tanstack/react-query'

async function fetchServiceOrderById({ id }: { id: string }) {
  try {
    const { data } = await axios.get(`/api/service-orders?id=${id}`)

    return data.data as TServiceOrderWithProjectDTO
  } catch (error) {
    throw error
  }
}
export function useServiceOrderById({ id }: { id: string }) {
  return useQuery({
    queryKey: ['service-order-by-id', id],
    queryFn: async () => await fetchServiceOrderById({ id }),
  })
}

async function fetchServiceOrderByProjectId({ projectId }: { projectId: string }) {
  try {
    const { data } = await axios.get(`/api/service-orders?projectId=${projectId}`)

    return data.data as TServiceOrderDTO[]
  } catch (error) {
    throw error
  }
}
export function useServiceOrderByProjectId({ projectId }: { projectId: string }) {
  return useQuery({
    queryKey: ['service-order-by-project-id', projectId],
    queryFn: async () => await fetchServiceOrderByProjectId({ projectId }),
  })
}

async function fetchServiceOrders() {
  try {
    const { data } = await axios.get('/api/service-orders')
    return data.data as TServiceOrderDTO[]
  } catch (error) {
    throw error
  }
}

export function useServiceOrders() {
  return useQuery({
    queryKey: ['service-orders'],
    queryFn: fetchServiceOrders,
  })
}
