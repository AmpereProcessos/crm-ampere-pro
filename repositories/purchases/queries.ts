import { TPurchase, TPurchaseWithProject } from '@/utils/schemas/purchase.schema'
import { Collection, Filter, ObjectId } from 'mongodb'

type GetPurchaseByIdParams = {
  collection: Collection<TPurchase>
  id: string
  query: Filter<TPurchase>
}

export async function getPurchaseById({ collection, id, query }: GetPurchaseByIdParams) {
  try {
    const addFields = { projectAsObjectId: { $toObjectId: '$projeto.id' } }
    const lookup = { from: 'projects', localField: 'projectAsObjectId', foreignField: '_id', as: 'projetoDados' }

    const purchasesArr = await collection.aggregate([{ $match: { _id: new ObjectId(id), ...query } }, { $addFields: addFields }, { $lookup: lookup }]).toArray()

    const purchase = purchasesArr.map((p) => ({ ...p, projetoDados: p.projetoDados[0] }))

    return purchase[0] as TPurchaseWithProject
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
