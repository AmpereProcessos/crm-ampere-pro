import { TClient } from '@/utils/schemas/client.schema'
import { Collection, Filter, ObjectId } from 'mongodb'

type InsertClientParams = {
  collection: Collection<TClient>
  info: TClient
  partnerId: string
}

export async function insertClient({ collection, info, partnerId }: InsertClientParams) {
  try {
    const insertResponse = await collection.insertOne({ ...info, idParceiro: partnerId, dataInsercao: new Date().toISOString() })
    return insertResponse
  } catch (error) {
    throw error
  }
}
type UpdateClientParams = {
  id: string
  collection: Collection<TClient>
  changes: any
  query: Filter<TClient>
}
export async function updateClient({ id, collection, changes, query }: UpdateClientParams) {
  try {
    const updateResponse = await collection.updateOne({ _id: new ObjectId(id), ...query }, { $set: { ...changes } })
    return updateResponse
  } catch (error) {
    throw error
  }
}
