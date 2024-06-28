import { TRevenue, TRevenueDTO, TRevenueWithProject } from '@/utils/schemas/revenues.schema'
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
    const revenues = await collection.aggregate([{ $sort: sort }, { $match: match }, { $skip: skip }, { $limit: limit }]).toArray()

    return { revenues, revenuesMatched } as { revenues: TRevenueDTO[]; revenuesMatched: number }
  } catch (error) {
    throw error
  }
}
