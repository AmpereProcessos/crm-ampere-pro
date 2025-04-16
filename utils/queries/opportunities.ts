import axios from 'axios'
import {
  TOpportunityDTO,
  TOpportunityDTOWithClient,
  TOpportunityDTOWithClientAndPartnerAndFunnelReferences,
  TOpportunityDTOWithFunnelReferenceAndActivities,
  TOpportunityDTOWithFunnelReferenceAndActivitiesByStatus,
  TOpportunitySimplifiedDTO,
  TOpportunitySimplifiedDTOWithProposalAndActivitiesAndFunnels,
  TOpportunityWithFunnelReferenceAndActivitiesByStatus,
  TPersonalizedOpportunitiesFilter,
} from '../schemas/opportunity.schema'
import { useQuery } from '@tanstack/react-query'
import { TResultsExportsItem } from '@/pages/api/stats/comercial-results/results-export'
import { TOpportunitiesByFastSearch, TOpportunitiesByFilterResult } from '@/pages/api/opportunities/search'
import { useState } from 'react'
import { TOpportunitiesQueryOptions } from '@/pages/api/opportunities/query-options'

type UseOpportunitiesParams = {
  responsibles: string[] | null
  funnel: string | null
  after: string | undefined
  before: string | undefined
  status: 'GANHOS' | 'PERDIDOS' | undefined
}
async function fetchOpportunities({ responsibles, funnel, after, before, status }: UseOpportunitiesParams) {
  try {
    const { data } = await axios.get(`/api/opportunities?responsible=${responsibles}&funnel=${funnel}&after=${after}&before=${before}&status=${status}`)
    return data.data as TOpportunitySimplifiedDTOWithProposalAndActivitiesAndFunnels[]
  } catch (error) {
    throw error
  }
}
export function useOpportunities({ responsibles, funnel, after, before, status }: UseOpportunitiesParams) {
  return useQuery({
    queryKey: ['opportunities', responsibles, funnel, after, before, status],
    queryFn: async () => await fetchOpportunities({ responsibles, funnel, after, before, status }),
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

export type TOpportunitiesByFastSearchParams = {
  searchParam: string
  page: number
}
async function fetchOpportunitiesBySearch({ searchParam, page }: TOpportunitiesByFastSearchParams): Promise<TOpportunitiesByFastSearch> {
  try {
    if (searchParam.trim().length < 3)
      return {
        opportunities: [],
        opportunitiesMatched: 0,
        totalPages: 0,
      }
    const { data } = await axios.get(`/api/opportunities/search?searchParam=${searchParam}&page=${page}`)
    return data.data as TOpportunitiesByFastSearch
  } catch (error) {
    throw error
  }
}

export function useOpportunitiesBySearch({ searchParam, page }: { searchParam: string; page: number }) {
  return useQuery({
    queryKey: ['opportunities-by-search', searchParam, page],
    queryFn: async () => await fetchOpportunitiesBySearch({ searchParam, page }),
  })
}

export async function fetchOpportunityExport({ responsibles, funnel, after, before, status }: UseOpportunitiesParams) {
  try {
    const { data } = await axios.get(`/api/opportunities/export?responsible=${responsibles}&funnel=${funnel}&after=${after}&before=${before}&status=${status}`)
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
    refetchOnWindowFocus: false,
  })
}

async function fetchOpportunitiesUltraSimplified() {
  try {
    const { data } = await axios.get('/api/opportunities/simplified')
    return data.data as TOpportunitySimplifiedDTO[]
  } catch (error) {
    throw error
  }
}

export function useOpportunitiesUltraSimplified() {
  return useQuery({
    queryKey: ['opportunities-ultra-simplified'],
    queryFn: fetchOpportunitiesUltraSimplified,
  })
}
