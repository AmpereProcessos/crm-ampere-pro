import { TPurchase } from '@/utils/schemas/purchase.schema'
import { Collection, Filter, ObjectId } from 'mongodb'

type GetPurchaseByIdParams = {
  collection: Collection<TPurchase>
  id: string
  query: Filter<TPurchase>
}

export async function getPurchaseById({ collection, id, query }: GetPurchaseByIdParams) {
  try {
    const purchase = await collection.findOne({ _id: new ObjectId(id), ...query })

    return purchase
  } catch (error) {
    throw error
  }
}

type GetPurchasesByProjectIdParams = {
  collection: Collection<TPurchase>
  projectId: string
  query: Filter<TPurchase>
}

export async function getPurchasesByProjectId({ collection, projectId, query }: GetPurchasesByProjectIdParams) {
  try {
    const purchases = await collection.find({ 'projeto.id': projectId, ...query }).toArray()
    return purchases
  } catch (error) {
    throw error
  }
}

type GetPurchasesParams = {
  collection: Collection<TPurchase>
  query: Filter<TPurchase>
}
export async function getPurchases({ collection, query }: GetPurchasesParams) {
  try {
    const purchases = await collection.find({ ...query }).toArray()
    return purchases
  } catch (error) {
    throw error
  }
}
