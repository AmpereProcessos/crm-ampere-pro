import axios from 'axios'
import { TPurchaseDTO } from '../schemas/purchase.schema'
import { useQuery } from '@tanstack/react-query'

async function fetchPurchaseById({ id }: { id: string }) {
  try {
    const { data } = await axios.get(`/api/purchases?id=${id}`)
    return data.data as TPurchaseDTO
  } catch (error) {
    throw error
  }
}

export function usePurchaseById({ id }: { id: string }) {
  return useQuery({
    queryKey: ['purchase-by-id', id],
    queryFn: async () => fetchPurchaseById({ id }),
  })
}

async function fetchPurchasesByProjectId({ projectId }: { projectId: string }) {
  try {
    const { data } = await axios.get(`/api/purchases?projectId=${projectId}`)
    return data.data as TPurchaseDTO[]
  } catch (error) {
    throw error
  }
}

export function usePurchasesByProjectId({ projectId }: { projectId: string }) {
  return useQuery({
    queryKey: ['purchase-by-project-id', projectId],
    queryFn: async () => await fetchPurchasesByProjectId({ projectId }),
  })
}

async function fetchPurchases() {
  try {
    const { data } = await axios.get('/api/purchases')
    return data.data as TPurchaseDTO[]
  } catch (error) {
    throw error
  }
}

export function usePurchases() {
  return useQuery({
    queryKey: ['purchases'],
    queryFn: async () => fetchPurchases(),
  })
}
