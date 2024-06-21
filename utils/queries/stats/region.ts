import { TResultsByRegion } from '@/pages/api/stats/comercial-results/sales-region'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

type UseRegionResultsParams = {
  after: string
  before: string
  responsibles: string[] | null
  partners: string[] | null
  projectTypes: string[] | null
}
async function fetchStats({ after, before, responsibles, partners, projectTypes }: UseRegionResultsParams) {
  try {
    const { data } = await axios.post(`/api/stats/comercial-results/sales-region?after=${after}&before=${before}`, { responsibles, partners, projectTypes })
    return data.data as TResultsByRegion[]
  } catch (error) {
    throw error
  }
}

export function useResultsByRegion({ after, before, responsibles, partners, projectTypes }: UseRegionResultsParams) {
  return useQuery({
    queryKey: ['results-by-region', after, before, responsibles, partners, projectTypes],
    queryFn: async () => await fetchStats({ after, before, responsibles, partners, projectTypes }),
  })
}
