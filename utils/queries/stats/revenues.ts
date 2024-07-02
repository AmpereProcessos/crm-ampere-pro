import { TRevenueStatsResults } from '@/pages/api/stats/finances/revenues'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

type UseRevenueStatsParams = {
  after: string
  before: string
  partners: string[] | null
  projectTypes: string[] | null
}

async function fetchStats({ after, before, partners, projectTypes }: UseRevenueStatsParams) {
  try {
    const { data } = await axios.post(`/api/stats/finances/revenues?after=${after}&before=${before}`, { partners, projectTypes })

    return data.data as TRevenueStatsResults
  } catch (error) {
    throw error
  }
}

export function useRevenueStats({ after, before, partners, projectTypes }: UseRevenueStatsParams) {
  return useQuery({
    queryKey: ['revenue-stats', after, before, partners, projectTypes],
    queryFn: async () => await fetchStats({ after, before, partners, projectTypes }),
  })
}
