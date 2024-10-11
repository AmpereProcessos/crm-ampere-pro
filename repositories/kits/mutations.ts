import { TKit } from '@/utils/schemas/kits.schema'
import { Collection, Filter, ObjectId } from 'mongodb'

type InsertKitParams = {
  collection: Collection<TKit>
  info: TKit
  partnerId: string
}
export async function insertKit({ collection, info, partnerId }: InsertKitParams) {
  try {
    const insertResponse = await collection.insertOne({ ...info, dataInsercao: new Date().toISOString() })
    return insertResponse
  } catch (error) {
    throw error
  }
}

type UpdateKitParams = {
  id: string
  collection: Collection<TKit>
  changes: TKit
  query: Filter<TKit>
}
export async function updateKit({ id, collection, changes, query }: UpdateKitParams) {
  try {
    const updateResponse = await collection.updateOne({ _id: new ObjectId(id), ...query }, { $set: { ...changes } })
    return updateResponse
  } catch (error) {
    throw error
  }
}

type InsertManyKitsParams = {
  collection: Collection<TKit>
  info: TKit[]
}
export async function insertManyKits({ collection, info }: InsertManyKitsParams) {
  try {
    const fixedKits = info.map((kit) => ({ ...kit, dataInsercao: new Date().toISOString() }))
    const insertResponse = await collection.insertMany(fixedKits)
    return insertResponse
  } catch (error) {
    throw error
  }
}
