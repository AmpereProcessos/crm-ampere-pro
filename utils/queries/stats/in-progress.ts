import { TByFunnelResults, TInProgressResults } from '@/pages/api/stats/comercial-results/sales-funnels'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

type UseInProgressResultsParams = {
  after: string
  before: string
  responsibles: string[] | null
  partners: string[] | null
  projectTypes: string[] | null
}
async function fetchStats({ after, before, responsibles, partners, projectTypes }: UseInProgressResultsParams) {
  try {
    const { data } = await axios.post(`/api/stats/comercial-results/sales-funnels?after=${after}&before=${before}`, {
      responsibles,
      partners,
      projectTypes,
    })
    return data.data as TByFunnelResults
  } catch (error) {
    throw error
  }
}

export function useInProgressResults({ after, before, responsibles, partners, projectTypes }: UseInProgressResultsParams) {
  return useQuery({
    queryKey: ['in-progress-results', after, before, responsibles, partners, projectTypes],
    queryFn: async () => await fetchStats({ after, before, responsibles, partners, projectTypes }),
    refetchOnMount: false,
  })
}
