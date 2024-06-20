import { AnyBulkWriteOperation, Collection, Db, ObjectId } from 'mongodb'
import { TProcessFlowInsertionReference } from './general'
import { TNotification } from '@/utils/schemas/notification.schema'
import { TProcessFlowReference } from '@/utils/schemas/process-flow-reference.schema'

type HandleNotificationProcessFlowInsertionsParams = {
  database: Db
  insertionReferences: TProcessFlowInsertionReference[]
}
export async function handleNotificationProcessFlowInsertions({ database, insertionReferences }: HandleNotificationProcessFlowInsertionsParams) {
  try {
    // Getting the insertion references that refer to Notification entity
    const notificationInsertionReferences = insertionReferences.filter((i) => i.entity == 'Notification')
    // If the list is empty, nothing to be done, then returning
    if (notificationInsertionReferences.length == 0) return []
    // Else, getting the notifications and inserting them based on the "data" field of insertion references
    const notifications = notificationInsertionReferences.map((i) => i.data)
    const notificationsCollection: Collection<TNotification> = database.collection('notifications')
    const insertResponse = await notificationsCollection.insertMany(notifications)
    console.log('NOTIFICATIONS INSERT', insertResponse)
    // Based on the inserted ids, establishing bulkwrite operators to update each next process flow that depends on this entity to active from now on
    const insertedIds = Object.values(insertResponse.insertedIds).map((id) => id.toString())
    const dependecyBulkwriteOperators = insertionReferences
      .filter((i) => i.entity == 'Notification')
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
