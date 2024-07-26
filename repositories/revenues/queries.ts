import { RevenueSimplifiedProjection, TReceipt, TRevenue, TRevenueDTO, TRevenueDTOSimplified, TRevenueWithProject } from '@/utils/schemas/revenues.schema'
import { Collection, Filter, ObjectId } from 'mongodb'

type GetRevenueByIdParams = {
  id: string
  collection: Collection<TRevenue>
  query: Filter<TRevenue>
}

export async function getRevenueById({ id, collection, query }: GetRevenueByIdParams) {
  try {
    const addFields = { projectAsObjectId: { $toObjectId: '$projeto.id' } }
    const lookup = { from: 'projects', localField: 'projectAsObjectId', foreignField: '_id', as: 'projetoDados' }

    const revenuesArr = await collection.aggregate([{ $match: { _id: new ObjectId(id), ...query } }, { $addFields: addFields }, { $lookup: lookup }]).toArray()

    const revenue = revenuesArr.map((p) => ({ ...p, projetoDados: p.projetoDados[0] }))

    return revenue[0] as TRevenueWithProject
  } catch (error) {
    throw error
  }
}
type GetRevenuesByProjectIdParams = {
  projectId: string
  collection: Collection<TRevenue>
  query: Filter<TRevenue>
}

export async function getRevenuesByProjectId({ projectId, collection, query }: GetRevenuesByProjectIdParams) {
  try {
    const revenues = await collection.find({ 'projeto.id': projectId, ...query }).toArray()

    return revenues
  } catch (error) {
    throw error
  }
}

type GetRevenuesParams = {
  collection: Collection<TRevenue>
  query: Filter<TRevenue>
}
export async function getRevenues({ collection, query }: GetRevenuesParams) {
  try {
    const revenues = await collection.find({ ...query }).toArray()
    return revenues
  } catch (error) {
    throw error
  }
}

type GetRevenuesByFiltersParams = {
  collection: Collection<TRevenue>
  query: Filter<TRevenue>
  skip: number
  limit: number
}
export async function getRevenuesByFilters({ collection, query, skip, limit }: GetRevenuesByFiltersParams) {
  try {
    const revenuesMatched = await collection.countDocuments({ ...query })
    const sort = { _id: -1 }
    const match = { ...query }
    const revenues = await collection
      .aggregate([{ $sort: sort }, { $match: match }, { $skip: skip }, { $limit: limit }, { $project: RevenueSimplifiedProjection }])
      .toArray()

    return { revenues, revenuesMatched } as { revenues: TRevenueDTOSimplified[]; revenuesMatched: number }
  } catch (error) {
    throw error
  }
}

type GetReceiptsByFilterParams = {
  collection: Collection<TRevenue>
  query: Filter<TRevenue>
  skip: number
  limit: number
}

export async function getReceiptsByFilters({ collection, query, limit, skip }: GetReceiptsByFilterParams) {
  try {
    const match = { ...query }
    const unwind = { path: '$recebimentos', includeArrayIndex: 'indexRecebimento', preserveNullAndEmptyArrays: false }
    const sort = { 'recebimentos.efetivado': 1, 'recebimentos.dataRecebimento': -1 }

    const receiptsMatched = (await collection.aggregate([{ $match: match }, { $unwind: unwind }, { $count: 'contagem' }]).toArray())[0]?.contagem || 0

    const projection = { titulo: 1, recebimentos: 1, indexRecebimento: 1 }
    const receipts = (await collection
      .aggregate([{ $match: match }, { $unwind: unwind }, { $project: projection }, { $sort: sort }, { $skip: skip }, { $limit: limit }])
      .toArray()) as TReceipt[]

    return { receipts, receiptsMatched } as { receipts: TReceipt[]; receiptsMatched: number }
  } catch (error) {
    throw error
  }
}
