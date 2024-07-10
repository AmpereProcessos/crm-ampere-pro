import { TOperationProjectsResults } from '@/pages/api/stats/operation/general-view'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

async function fetchOperationGeneralViewData({ after, before }: { after: string; before: string }) {
  try {
    const { data } = await axios.post(`/api/stats/operation/general-view?after=${after}&before=${before}`)

    return data.data as TOperationProjectsResults
  } catch (error) {
    throw error
  }
}

export function useOperationGeneralViewStats({ after, before }: { after: string; before: string }) {
  return useQuery({
    queryKey: ['operation-general-view-stats', after, before],
    queryFn: async () => await fetchOperationGeneralViewData({ after, before }),
    refetchOnWindowFocus: false,
  })
}
