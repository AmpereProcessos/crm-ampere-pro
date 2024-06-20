import { AnyBulkWriteOperation, Collection, Db, ObjectId } from 'mongodb'
import { TProcessFlowInsertionReference } from './general'
import { TRevenue } from '@/utils/schemas/revenues.schema'
import { TProcessFlowReference } from '@/utils/schemas/process-flow-reference.schema'

type HandleRevenuesProcessFlowInsertionsParams = {
  database: Db
  insertionReferences: TProcessFlowInsertionReference[]
}
export async function handleRevenuesProcessFlowInsertions({ database, insertionReferences }: HandleRevenuesProcessFlowInsertionsParams) {
  try {
    // Getting the insertion references that refer to Revenue entity
    const revenueInsertionReferences = insertionReferences.filter((i) => i.entity == 'Revenue')
    // If the list is empty, nothing to be done, then returning
    if (revenueInsertionReferences.length == 0) return []
    // Else, getting the revenues and inserting them based on the "data" field of insertion references
    const revenues = revenueInsertionReferences.map((i) => i.data)
    const revenuesCollection: Collection<TRevenue> = database.collection('revenues')
    const insertResponse = await revenuesCollection.insertMany(revenues)
    console.log('REVENUES INSERT', insertResponse)
    // Based on the inserted ids, establishing bulkwrite operators to update each next process flow that depends on this entity to active from now on
    const insertedIds = Object.values(insertResponse.insertedIds).map((id) => id.toString())
    const dependecyBulkwriteOperators = insertionReferences
      .filter((i) => i.entity == 'Revenue')
      .map((a, index) => {
        const generatedId = insertedIds[index]
        return a.dependingFlowIds.map((f) => ({
          updateOne: {
            filter: { _id: new ObjectId(f) },
            update: {
              $set: {
                'ativacao.referencia.id': generatedId,
              },
            },
          },
        }))
      })
      .flat(1)
    return dependecyBulkwriteOperators as AnyBulkWriteOperation<TProcessFlowReference>[]
  } catch (error) {
    throw error
  }
}
