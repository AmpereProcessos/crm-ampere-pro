import { TExpense } from '@/utils/schemas/expenses.schema'
import { Collection, Filter, ObjectId } from 'mongodb'

type InsertExpenseParams = {
  collection: Collection<TExpense>
  info: TExpense
}
export async function insertExpense({ collection, info }: InsertExpenseParams) {
  try {
    const insertResponse = await collection.insertOne({ ...info })

    return insertResponse
  } catch (error) {
    throw error
  }
}

type UpdateExpenseParams = {
  id: string
  collection: Collection<TExpense>
  changes: Partial<TExpense>
  query: Filter<TExpense>
}
export async function updateExpense({ id, collection, changes, query }: UpdateExpenseParams) {
  try {
    const updateResponse = await collection.updateOne({ _id: new ObjectId(id), ...query }, { $set: { ...changes } })

    return updateResponse
  } catch (error) {
    throw error
  }
}
