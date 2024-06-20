import { AnyBulkWriteOperation, Collection, Db, Filter, ObjectId } from 'mongodb'
import { TProcessFlowInsertionReference, validateProcessFlowTrigger } from './general'
import { TActivity } from '@/utils/schemas/activities.schema'
import { TProcessFlowReference, TProcessFlowTrigger } from '@/utils/schemas/process-flow-reference.schema'
import { getActivityById } from '@/repositories/acitivities/queries'
import { getProcessFlowReferences } from '@/repositories/process-flows-references/queries'
import { TProcessAutomationConditionData } from '../helpers'
import { TProject } from '@/utils/schemas/project.schema'
import { getProjectById } from '@/repositories/projects/queries'
import { TProcessAutomationEntities } from '..'
import { getProjectToEntity } from './project'
import { handleRevenuesProcessFlowInsertions } from './revenue'
import { handleNotificationProcessFlowInsertions } from './notification'
import { handlePurchaseProcessFlowInsertions } from './purchase'
import createHttpError from 'http-errors'

type HandleProcessAutomationsByActivityTrackingParams = {
  database: Db
  activityId: string
}
export async function handleProcessAutomationsByActivityTracking({ database, activityId }: HandleProcessAutomationsByActivityTrackingParams) {
  try {
    const activitiesCollection: Collection<TActivity> = database.collection('activities')
    const activity = await getActivityById({ id: activityId, collection: activitiesCollection, query: {} })
    if (!activity) return
    const projectId = activity.projeto?.id
    if (!projectId) return
    // Getting projects up to date data
    const projectsCollection: Collection<TProject> = database.collection('projects')
    const project = await getProjectById({ id: projectId, collection: projectsCollection, query: {} })
    if (!project) return

    const flowReferencesCollection: Collection<TProcessFlowReference> = database.collection('process-flow-references')
    // Defining the query for the non concluded flow references for the given project
    const flowReferencesQuery: Filter<TProcessFlowReference> = { idProjeto: projectId, dataExecucao: null }
    const flowReferences = await getProcessFlowReferences({ collection: flowReferencesCollection, query: flowReferencesQuery })

    // If there arent pending flow references to execute, then returning
    if (flowReferences.length == 0) return

    // Defining the condition data to validate triggers
    const conditionData: TProcessAutomationConditionData = {
      projetoAprovado: 'NÃO',
      statusContrato: 'N/A', // PROJECT ENTITY
      porcentagemReceitaRecebida: 0,
      pedidoCompraFeito: 'NÃO',
      entregaCompraFeita: 'NÃO',
      ordemServicoConcluida: 'NÃO',
      atividadeConcluida: !!activity.dataConclusao ? 'SIM' : 'NÃO',
    }
    const insertionReferences: TProcessFlowInsertionReference[] = flowReferences
      .filter((flowReference) => flowReference.ativacao?.referencia.id == activityId && flowReference.ativacao?.referencia.identificacao == 'Activity')
      .filter((flowReference) => {
        // First, filtering the process flow references for the ones that trigger condition is matched
        const trigger = flowReference.ativacao?.gatilho as TProcessFlowTrigger
        const validationResult = validateProcessFlowTrigger({ trigger, conditionData })
        return validationResult
      })
      .map((flowReference) => {
        // Second, getting the insertion reference based on the customization data and the interconnected data for the entity of return
        // The interconnected data are defined as partial information coming from other connected entities, such as project, revenue, purchase, etc
        const flowId = flowReference._id
        const dependingFlowIds = flowReferences.filter((f) => f.idProcessoReferenciaPai == flowId.toString()).map((f) => f._id)
        const flowReferenceEntity = flowReference.entidade
        const flowReferenceEntityIdentification = flowReferenceEntity.identificacao as TProcessAutomationEntities
        const flowReferenceEntityCustomization = flowReferenceEntity.customizacao
        const flowReferenceEntityData = getProjectToEntity({ project, flowReferenceEntityCustomization, flowReferenceEntityIdentification })
        if (!flowReferenceEntityData) return null
        return { flowId: flowId, dependingFlowIds: dependingFlowIds, entity: flowReferenceEntityIdentification, data: flowReferenceEntityData }
      }) // Third, filtering only the valid insertion references
      .filter((i) => !!i)

    console.log('INSERTION REFERENCES', insertionReferences)
    // Based on the insertion references, updating the executed flows dataExecucao field with the current date
    const flowsToConcludeIds = insertionReferences.map((i) => i.flowId)
    await flowReferencesCollection.updateMany({ _id: { $in: flowsToConcludeIds } }, { $set: { dataExecucao: new Date().toISOString() } })

    // Now, handling the insertion of the process flow references and getting back the dependency bulkwrite operators
    const activityDependencyBulkwriteOperators = await handleActivitiesProcessFlowInsertions({ database, insertionReferences })
    const revenueDependencyBulkwriteOperators = await handleRevenuesProcessFlowInsertions({ database, insertionReferences })
    const notificationDependencyBulkwriteOperators = await handleNotificationProcessFlowInsertions({ database, insertionReferences })
    const purchaseDependencyBulkwriteOperators = await handlePurchaseProcessFlowInsertions({ database, insertionReferences })

    const bulkwriteArr: AnyBulkWriteOperation<TProcessFlowReference>[] = [
      ...activityDependencyBulkwriteOperators,
      ...revenueDependencyBulkwriteOperators,
      ...notificationDependencyBulkwriteOperators,
      ...purchaseDependencyBulkwriteOperators,
    ]
    // If bulkwriteArr are non empty, using the bulkWrite method to update flows
    if (bulkwriteArr.length > 0) await flowReferencesCollection.bulkWrite(bulkwriteArr)

    return
  } catch (error) {
    console.log(error)
    throw new createHttpError.InternalServerError('Oops, houve um erro desconhecido ao executar automações.')
  }
}
type HandleActivitiesProcessFlowInsertionsParams = {
  database: Db
  insertionReferences: TProcessFlowInsertionReference[]
}
export async function handleActivitiesProcessFlowInsertions({ database, insertionReferences }: HandleActivitiesProcessFlowInsertionsParams) {
  try {
    // Getting the insertion references that refer to Activity entity
    const activityInsertionReferences = insertionReferences.filter((i) => i.entity == 'Activity')
    // If the list is empty, nothing to be done, then returning
    if (activityInsertionReferences.length == 0) return []
    // Else, getting the activities and inserting them based on the "data" field of insertion references
    const activities = insertionReferences.filter((i) => i.entity == 'Activity').map((i) => i.data)
    const activitiesCollection: Collection<TActivity> = database.collection('activities')
    const insertResponse = await activitiesCollection.insertMany(activities)
    console.log('ACTIVITY INSERT', insertResponse)
    // Based on the inserted ids, establishing bulkwrite operators to update each next process flow that depends on this entity to active from now on
    const insertedIds = Object.values(insertResponse.insertedIds).map((id) => id.toString())
    const dependecyBulkwriteOperators = insertionReferences
      .filter((i) => i.entity == 'Activity')
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
