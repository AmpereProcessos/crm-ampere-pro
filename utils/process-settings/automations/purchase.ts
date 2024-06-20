import { AnyBulkWriteOperation, Collection, Db, ObjectId } from 'mongodb'
import { TProcessFlowInsertionReference } from './general'
import { TProcessFlowReference } from '@/utils/schemas/process-flow-reference.schema'
import { TPurchase } from '@/utils/schemas/purchase.schema'

type HandlePurchaseProcessFlowInsertionsParams = {
  database: Db
  insertionReferences: TProcessFlowInsertionReference[]
}
export async function handlePurchaseProcessFlowInsertions({ database, insertionReferences }: HandlePurchaseProcessFlowInsertionsParams) {
  try {
    // Getting the insertion references that refer to Purchase entity
    const purchaseInsertionReferences = insertionReferences.filter((i) => i.entity == 'Purchase')
    // If the list is empty, nothing to be done, then returning
    if (purchaseInsertionReferences.length == 0) return []
    // Else, getting the purchases and inserting them based on the "data" field of insertion references
    const purchases = purchaseInsertionReferences.map((i) => i.data)
    const purchasesCollection: Collection<TPurchase> = database.collection('purchases')
    const insertResponse = await purchasesCollection.insertMany(purchases)
    console.log('PURCHASE INSERT', insertResponse)
    // Based on the inserted ids, establishing bulkwrite operators to update each next process flow that depends on this entity to active from now on
    const insertedIds = Object.values(insertResponse.insertedIds).map((id) => id.toString())
    const dependecyBulkwriteOperators = insertionReferences
      .filter((i) => i.entity == 'Purchase')
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
