import { TProposalUpdateRecord, TProposalUpdateRecordDTO } from '@/utils/schemas/proposal-update-records.schema'
import { Collection, Filter, ObjectId } from 'mongodb'

type InsertProposalUpdateRecordParams = {
  collection: Collection<TProposalUpdateRecord>
  info: TProposalUpdateRecord
  partnerId: string
}
export async function insertProposalUpdateRecord({ collection, info, partnerId }: InsertProposalUpdateRecordParams) {
  try {
    const insertResponse = await collection.insertOne({ ...info, dataInsercao: new Date().toISOString() })
    return insertResponse
  } catch (error) {
    throw error
  }
}

type UpdateProposalUpdateRecordParams = {
  id: string
  collection: Collection<TProposalUpdateRecord>
  changes: Partial<TProposalUpdateRecord>
  partnerId: string
}

export async function updateProposalUpdateRecord({ id, collection, changes, partnerId }: UpdateProposalUpdateRecordParams) {
  try {
    const updateResponse = await collection.updateOne({ _id: new ObjectId(id), idParceiro: partnerId }, { $set: { ...changes } })
    return updateResponse
  } catch (error) {
    throw error
  }
}
