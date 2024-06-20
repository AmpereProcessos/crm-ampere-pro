import { TSaleGoal } from '@/utils/schemas/sale-goal.schema'
import { Collection, Filter } from 'mongodb'

type GetSaleGoalsByUserIdParams = {
  collection: Collection<TSaleGoal>
  userId: string
  query: Filter<TSaleGoal>
}
export async function getSaleGoalsByUserId({ collection, userId, query }: GetSaleGoalsByUserIdParams) {
  try {
    const saleGoals = await collection.find({ 'usuario.id': userId, ...query }).toArray()
    return saleGoals
  } catch (error) {
    throw error
  }
}
