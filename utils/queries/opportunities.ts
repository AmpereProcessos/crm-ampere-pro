import axios from 'axios'
import {
  TOpportunityDTO,
  TOpportunityDTOWithClient,
  TOpportunityDTOWithClientAndPartnerAndFunnelReferences,
  TOpportunityDTOWithFunnelReferenceAndActivities,
  TOpportunityDTOWithFunnelReferenceAndActivitiesByStatus,
  TOpportunitySimplifiedDTOWithProposalAndActivitiesAndFunnels,
  TOpportunityWithFunnelReferenceAndActivitiesByStatus,
  TPersonalizedOpportunitiesFilter,
} from '../schemas/opportunity.schema'
import { useQuery } from '@tanstack/react-query'
import { TResultsExportsItem } from '@/pages/api/stats/comercial-results/results-export'
import { TOpportunitiesByFilterResult } from '@/pages/api/opportunities/search'
import { useState } from 'react'
import { TOpportunitiesQueryOptions } from '@/pages/api/opportunities/query-options'

type UseOpportunitiesParams = {
  responsible: string | null
  funnel: string | null
  after: string | undefined
  before: string | undefined
  status: 'GANHOS' | 'PERDIDOS' | undefined
}
async function fetchOpportunities({ responsible, funnel, after, before, status }: UseOpportunitiesParams) {
  try {
    const { data } = await axios.get(`/api/opportunities?responsible=${responsible}&funnel=${funnel}&after=${after}&before=${before}&status=${status}`)
    return data.data as TOpportunitySimplifiedDTOWithProposalAndActivitiesAndFunnels[]
  } catch (error) {
    throw error
  }
}
export function useOpportunities({ responsible, funnel, after, before, status }: UseOpportunitiesParams) {
  return useQuery({
    queryKey: ['opportunities', responsible, funnel, after, before, status],
    queryFn: async () => await fetchOpportunities({ responsible, funnel, after, before, status }),
  })
}

async function fetchOpportunity({ opportunityId }: { opportunityId: string }) {
  try {
    const { data } = await axios.get(`/api/opportunities?id=${opportunityId}`)
    return data.data as TOpportunityDTOWithClientAndPartnerAndFunnelReferences
  } catch (error) {
    throw error
  }
}
export function useOpportunityById({ opportunityId }: { opportunityId: string }) {
  return useQuery({
    queryKey: ['opportunity-by-id', opportunityId],
    queryFn: async () => await fetchOpportunity({ opportunityId }),
  })
}

async function fetchOpportunitiesBySearch({ param }: { param: string }) {
  try {
    if (param.trim().length < 3) return []
    const { data } = await axios.get(`/api/opportunities/search?param=${param}`)
    return data.data as TOpportunityDTO[]
  } catch (error) {
    throw error
  }
}

export function useOpportunitiesBySearch({ param }: { param: string }) {
  return useQuery({
    queryKey: ['opportunities-by-search', param],
    queryFn: async () => await fetchOpportunitiesBySearch({ param }),
  })
}

export async function fetchOpportunityExport({ responsible, funnel, after, before, status }: UseOpportunitiesParams) {
  try {
    const { data } = await axios.get(`/api/opportunities/export?responsible=${responsible}&funnel=${funnel}&after=${after}&before=${before}&status=${status}`)
    return data.data as TResultsExportsItem[]
  } catch (error) {
    throw error
  }
}

type FetchOpportunitiesByPersonalizedFiltersParams = {
  page: number
  responsibles: string[] | null
  partners: string[] | null
  projectTypes: string[] | null
  filters: TPersonalizedOpportunitiesFilter
}
async function fetchOpportunitiesByPersonalizedFilters({ page, responsibles, partners, projectTypes, filters }: FetchOpportunitiesByPersonalizedFiltersParams) {
  try {
    const { data } = await axios.post(`/api/opportunities/search?page=${page}`, { responsibles, partners, projectTypes, filters })
    return data.data as TOpportunitiesByFilterResult
  } catch (error) {
    throw error
  }
}

type UseOpportunitiesByPersonalizedFiltersParams = {
  page: number
  responsibles: string[] | null
  partners: string[] | null
  projectTypes: string[] | null
}
export function useOpportunitiesByPersonalizedFilters({ page, partners, responsibles, projectTypes }: UseOpportunitiesByPersonalizedFiltersParams) {
  const [filters, setFilters] = useState<TPersonalizedOpportunitiesFilter>({
    name: '',
    city: [],
    period: {
      after: null,
      before: null,
      field: null,
    },
  })
  function updateFilters(filters: TPersonalizedOpportunitiesFilter) {
    setFilters(filters)
  }
  return {
    ...useQuery({
      queryKey: ['opportunities-by-personalized-filters', page, responsibles, partners, projectTypes, filters],
      queryFn: async () => await fetchOpportunitiesByPersonalizedFilters({ page, responsibles, partners, projectTypes, filters }),
    }),
    updateFilters,
  }
}

async function fetchOpportunitiesQueryOptions() {
  try {
    const { data } = await axios.get('/api/opportunities/query-options')
    return data.data as TOpportunitiesQueryOptions
  } catch (error) {
    throw error
  }
}

export function useOpportunitiesQueryOptions() {
  return useQuery({
    queryKey: ['opportunities-query-options'],
    queryFn: fetchOpportunitiesQueryOptions,
  })
}
