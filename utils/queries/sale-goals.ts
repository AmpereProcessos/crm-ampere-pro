import { UseQueryResult, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { ISaleGoal } from '../models'
import { TSaleGoalDTO } from '../schemas/sale-goal.schema'

async function fetchSaleGoalsByUserId({ userId }: { userId: string }) {
  try {
    const { data } = await axios.get(`/api/sale-goals?userId=${userId}`)
    return data.data as TSaleGoalDTO[]
  } catch (error) {
    throw error
  }
}

export function usePromoterSaleGoals(id: string) {
  return useQuery({
    queryKey: ['user-sale-goals', id],
    queryFn: async () => await fetchSaleGoalsByUserId({ userId: id }),
    refetchOnWindowFocus: false,
  })
}
