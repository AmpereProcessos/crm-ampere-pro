'use client'
import axios from 'axios'
import { TPersonalizedServiceOrderFilter, TServiceOrderDTO, TServiceOrderWithProjectAndAnalysisDTO } from '../schemas/service-order.schema'
import { useQuery } from '@tanstack/react-query'
import { TServiceOrderByFilters } from '@/pages/api/service-orders/search'
import { useState } from 'react'

export async function fetchServiceOrderById({ id }: { id: string }) {
  try {
    const { data } = await axios.get(`/api/service-orders?id=${id}`)

    return data.data as TServiceOrderWithProjectAndAnalysisDTO
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

type FetchServiceOrdersByPersonalizedFiltersParams = {
  page: number
  partners: string[] | null
  filters: TPersonalizedServiceOrderFilter
}

async function fetchServiceOrdersByPersonalizedFilters({ page, partners, filters }: FetchServiceOrdersByPersonalizedFiltersParams) {
  try {
    const { data } = await axios.post(`/api/service-orders/search?page=${page}`, { partners, filters })

    return data.data as TServiceOrderByFilters
  } catch (error) {
    throw error
  }
}

type UseServiceOrdersByFilters = {
  page: number
  partners: string[] | null
}
export function useServiceOrdersByFilters({ page, partners }: UseServiceOrdersByFilters) {
  const [filters, setFilters] = useState<TPersonalizedServiceOrderFilter>({
    name: '',
    state: [],
    city: [],
    category: [],
    urgency: [],
    period: {
      after: null,
      before: null,
      field: null,
    },
    pending: true,
  })

  function updateFilters(filters: TPersonalizedServiceOrderFilter) {
    setFilters(filters)
  }

  return {
    ...useQuery({
      queryKey: ['service-orders-by-personalized-filters', page, partners, filters],
      queryFn: async () => await fetchServiceOrdersByPersonalizedFilters({ page, partners, filters }),
    }),
    updateFilters,
  }
}
