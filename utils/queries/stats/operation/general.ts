import { TGeneralOperationStats } from '@/pages/api/stats/operation/general'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { NextApiHandler } from 'next'

async function fetchOperationGeneralStats({ after, before }: { after: string; before: string }) {
  try {
    const { data } = await axios.get(`/api/stats/operation/general?after=${after}&before=${before}`)
    return data.data as TGeneralOperationStats
  } catch (error) {
    throw error
  }
}

export function useOperationGeneralStats({ after, before }: { after: string; before: string }) {
  return useQuery({
    queryKey: ['operation-general-stats', after, before],
    queryFn: async () => fetchOperationGeneralStats({ after, before }),
  })
}
