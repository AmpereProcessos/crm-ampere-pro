import { TSellerSalesResults } from '@/pages/api/stats/comercial-results/sales-sellers'
import { TSalePromoterResultsById, TSalePromotersResults } from '@/pages/api/stats/comercial-results/sellers'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

type UseSalesTeamResultsParams = {
  after: string
  before: string
  responsibles: string[] | null
  partners: string[] | null
  projectTypes: string[] | null
}
async function fetchStats({ after, before, responsibles, partners, projectTypes }: UseSalesTeamResultsParams) {
  try {
    const { data } = await axios.post(`/api/stats/comercial-results/sales-sellers?after=${after}&before=${before}`, { responsibles, partners, projectTypes })
    return data.data as TSellerSalesResults
  } catch (error) {
    throw error
  }
}

export function useSalesTeamResults({ after, before, responsibles, partners, projectTypes }: UseSalesTeamResultsParams) {
  return useQuery({
    queryKey: ['sales-team-results', after, before, responsibles, partners, projectTypes],
    queryFn: async () => await fetchStats({ after, before, responsibles, partners, projectTypes }),
    refetchOnMount: false,
  })
}

type FetchSalePromotersResultsParams = {
  after: string
  before: string
}
async function fetchSalePromotersResults({ after, before }: FetchSalePromotersResultsParams) {
  try {
    const { data } = await axios.post(`/api/stats/comercial-results/sellers?after=${after}&before=${before}`)

    return data.data as TSalePromotersResults
  } catch (error) {
    throw error
  }
}

export function useSalePromotersResults({ after, before }: FetchSalePromotersResultsParams) {
  return useQuery({
    queryKey: ['sale-promoters-results', after, before],
    queryFn: async () => await fetchSalePromotersResults({ after, before }),
    refetchOnMount: false,
  })
}

type UseSalePromoterResultsByIdParams = {
  id: string
  firstPeriodAfter: string
  firstPeriodBefore: string
  secondPeriodAfter: string
  secondPeriodBefore: string
}
async function fetchSalePromoterResultsById({
  id,
  firstPeriodAfter,
  firstPeriodBefore,
  secondPeriodAfter,
  secondPeriodBefore,
}: UseSalePromoterResultsByIdParams) {
  try {
    const { data } = await axios.get(
      `/api/stats/comercial-results/sellers?id=${id}&firstPeriodAfter=${firstPeriodAfter}&firstPeriodBefore=${firstPeriodBefore}&secondPeriodAfter=${secondPeriodAfter}&secondPeriodBefore=${secondPeriodBefore}`
    )
    return data.data as TSalePromoterResultsById
  } catch (error) {
    throw error
  }
}

export function useSalePromoterResultsById({
  id,
  firstPeriodAfter,
  firstPeriodBefore,
  secondPeriodAfter,
  secondPeriodBefore,
}: UseSalePromoterResultsByIdParams) {
  return useQuery({
    queryKey: ['sale-promoter-results-by-id', id, firstPeriodAfter, firstPeriodBefore, secondPeriodAfter, secondPeriodBefore],
    queryFn: async () => fetchSalePromoterResultsById({ id, firstPeriodAfter, firstPeriodBefore, secondPeriodAfter, secondPeriodBefore }),
  })
}
