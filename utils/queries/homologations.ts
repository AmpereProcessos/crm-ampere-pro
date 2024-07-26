import axios from 'axios'
import { THomologationDTO } from '../schemas/homologation.schema'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { formatWithoutDiacritics } from '@/lib/methods/formatting'

async function fetchOpportunityHomologations({ opportunityId }: { opportunityId: string }) {
  try {
    const { data } = await axios.get(`/api/homologations?opportunityId=${opportunityId}`)

    return data.data as THomologationDTO[]
  } catch (error) {
    throw error
  }
}

export function useOpportunityHomologations({ opportunityId }: { opportunityId: string }) {
  return useQuery({
    queryKey: ['opportunity-homologations', opportunityId],
    queryFn: async () => await fetchOpportunityHomologations({ opportunityId }),
  })
}

export async function fetchHomologationById({ id }: { id: string }) {
  try {
    const { data } = await axios.get(`/api/homologations?id=${id}`)

    return data.data as THomologationDTO
  } catch (error) {
    throw error
  }
}

export function useHomologationById({ id }: { id: string }) {
  return useQuery({
    queryKey: ['homologation-by-id', id],
    queryFn: async () => await fetchHomologationById({ id }),
  })
}

async function fetchHomologations() {
  try {
    const { data } = await axios.get(`/api/homologations`)

    return data.data as THomologationDTO[]
  } catch (error) {
    throw error
  }
}

export type UseHomologationsFilters = {
  search: string
  status: string[]
}
export function useHomologations() {
  const [filters, setFilters] = useState<UseHomologationsFilters>({
    search: '',
    status: [],
  })

  function matchSearch(homologation: THomologationDTO) {
    if (filters.search.trim().length == 0) return true
    return formatWithoutDiacritics(homologation.titular.nome, true).includes(formatWithoutDiacritics(filters.search, true))
  }
  function matchStatus(homologation: THomologationDTO) {
    if (filters.status.length == 0) return true
    return filters.status.includes(homologation.status)
  }

  function handleModelData(data: THomologationDTO[]) {
    var modeledData = data
    return modeledData.filter((homologation) => matchSearch(homologation) && matchStatus(homologation))
  }
  return {
    ...useQuery({
      queryKey: ['homologations'],
      queryFn: fetchHomologations,
      select: (data) => handleModelData(data),
    }),
    filters,
    setFilters,
  }
}
