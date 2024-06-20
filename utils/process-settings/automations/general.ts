import { AnyBulkWriteOperation, Collection, Db, Filter, ObjectId, WithId } from 'mongodb'
import { TProcessAutomationEntities } from '..'
import createHttpError from 'http-errors'
import { TProject } from '@/utils/schemas/project.schema'
import { TProcessFlowReference, TProcessFlowTrigger } from '@/utils/schemas/process-flow-reference.schema'
import { getProcessFlowReferences } from '@/repositories/process-flows-references/queries'
import { getProjectByIdWithReferences } from '@/repositories/projects/queries'
import { TProcessAutomationConditionData } from '../helpers'
import { getProjectToActivityData, getProjectToEntity } from './project'
import { TActivity } from '@/utils/schemas/activities.schema'
import { TRevenue } from '@/utils/schemas/revenues.schema'
import { getRevenueReceivedTotal } from '@/lib/methods/extracting'
import { TPurchase } from '@/utils/schemas/purchase.schema'
import { TServiceOrder } from '@/utils/schemas/service-order.schema'
import { getActivityById } from '@/repositories/acitivities/queries'

export type TProcessFlowInsertionReference = { flowId: ObjectId; dependingFlowIds: ObjectId[]; entity: TProcessAutomationEntities; data: any }

type TInsertionReference = { flowId: ObjectId; dependingFlowIds: ObjectId[]; entity: TProcessAutomationEntities; data: any }

type HandleProcessAutomationsParams = {
  database: Db
  projectId: string
  entityToTrack: TProcessAutomationEntities
  idToTrack: string
}
export async function handleProcessAutomations({ database, projectId, entityToTrack, idToTrack }: HandleProcessAutomationsParams) {
  try {
    const flowReferencesCollection: Collection<TProcessFlowReference> = database.collection('process-flow-references')
    // Defining the query for the non concluded flow references for the projectId
    const flowReferencesQuery: Filter<TProcessFlowReference> = { idProjeto: projectId, dataExecucao: null }
    const allProjectFlowReferences = await getProcessFlowReferences({ collection: flowReferencesCollection, query: flowReferencesQuery })

    // Getting all the pending flow references based on the query
    const flowReferences = allProjectFlowReferences.filter(
      (flowReference) => flowReference.ativacao?.referencia.id == idToTrack && flowReference.ativacao?.referencia.identificacao == entityToTrack
    )
    // If there arent pending flow references to execute, then returning
    if (flowReferences.length == 0) return

    var insertionReferences: { flowId: ObjectId; dependingFlowIds: ObjectId[]; entity: TProcessAutomationEntities; data: any }[] = []
    var bulkWriteReferences = []

    const conditionData = getConditionData({ database, entityIdentification: entityToTrack, entityId: idToTrack })
    if (!conditionData) return

    switch (entityToTrack) {
      case 'Project':
        // In case entity to track is Project, getting project data and defining the trigger condition data
        const projectsCollection: Collection<TProject> = database.collection('projects')
        const project = await getProjectByIdWithReferences({ id: idToTrack, collection: projectsCollection, query: {} })
        if (!project) return
        const conditionData: TProcessAutomationConditionData = {
          projetoAprovado: !!project.aprovacao.dataAprovacao ? 'SIM' : 'NÃO',
          statusContrato: project.contrato.status, // PROJECT ENTITY
          porcentagemReceitaRecebida: 0,
          pedidoCompraFeito: 'NÃO',
          entregaCompraFeita: 'NÃO',
          ordemServicoConcluida: 'NÃO',
          atividadeConcluida: 'NÃO',
        }
        // First, filtering the flow references in which their trigger is matched by the current condition data
        // Second, getting the insertion reference and their respective data
        insertionReferences = flowReferences
          .filter((flowReference) => {
            const trigger = flowReference.ativacao?.gatilho as TProcessFlowTrigger
            const validationResult = validateCondition({ trigger, conditionData })
            return validationResult
          })
          .map((flowReference) => {
            const flowId = flowReference._id
            const dependingFlowIds = flowReferences.filter((f) => f.idProcessoReferenciaPai == flowId.toString()).map((f) => f._id)
            const flowReferenceEntity = flowReference.entidade
            const returnEntity = flowReferenceEntity.identificacao as TProcessAutomationEntities
            const returnCustomization = flowReferenceEntity.customizacao
            if (returnEntity == 'Activity') {
              return {
                flowId: flowId,
                dependingFlowIds: dependingFlowIds,
                entity: returnEntity,
                data: getProjectToActivityData({ project, customization: returnCustomization }),
              }
            }

            // Define the returns for every other entity
          })
          .filter((i) => !!i)

      default:
        insertionReferences = insertionReferences
    }

    if (insertionReferences.filter((i) => i.entity == 'Activity').length > 0) {
      // Filtering insertion references by each entity and using the respective collection to insert them
      const activities = insertionReferences.filter((i) => i.entity == 'Activity').map((i) => i.data)
      const activitiesCollection: Collection<TActivity> = database.collection('activities')
      const insertResponse = await activitiesCollection.insertMany(activities)
      // Based on the inserted ids, creating a bulkwrite operator to update each flow that depends them to active from now on
      const insertedIds = Object.values(insertResponse.insertedIds).map((id) => id.toString())
      const dependecyRelations = insertionReferences
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
      bulkWriteReferences = [...bulkWriteReferences, ...dependecyRelations]
    }
    // Create a equivalent script to the above for every other entity

    // Based on the insertion references, updating the executed flows dataExecucao field with the current date
    const flowsToConcludeIds = insertionReferences.map((i) => i.flowId)
    await flowReferencesCollection.updateMany({ _id: { $in: flowsToConcludeIds } }, { $set: { dataExecucao: new Date().toISOString() } })

    // If bulkwriteReferences are non empty, using the bulkWrite method to update flows
    // @ts-ignore
    if (bulkWriteReferences.length > 0) await flowReferencesCollection.bulkWrite(bulkWriteReferences)
    return
  } catch (error) {
    console.log(error)
    throw new createHttpError.InternalServerError('Oops, houve um erro desconhecido ao executar automações.')
  }
}

type ValidateConditionParams = {
  trigger: TProcessFlowTrigger
  conditionData: TProcessAutomationConditionData
}
export function validateProcessFlowTrigger({ trigger, conditionData }: ValidateConditionParams) {
  if (!trigger.tipo || trigger.tipo == 'IGUAL_TEXTO' || trigger.tipo == 'IGUAL_NÚMERICO') {
    // If there's a condition, extracting the conditionns comparators and the condition data to compare
    const conditionVariable = trigger.variavel
    const conditionValue = trigger.igual
    const condition = conditionData[conditionVariable as keyof typeof conditionData]
    // If condition is matched, then returning true
    if (condition == conditionValue) return true
    // If not, false
    return false
  }
  if (trigger.tipo == 'MAIOR_QUE_NÚMERICO') {
    // If there's a condition, extracting the conditionns comparators and the condition data to compare
    const conditionVariable = trigger.variavel
    const conditionValue = trigger.maiorQue || 0
    const condition = conditionData[conditionVariable as keyof typeof conditionData]
    // If condition is matched, then returning true
    if (Number(condition) > conditionValue) return true
    // If not, false
    return false
  }
  if (trigger.tipo == 'MENOR_QUE_NÚMERICO') {
    // If there's a condition, extracting the conditionns comparators and the condition data to compare
    const conditionVariable = trigger.variavel
    const conditionValue = trigger.maiorQue || 0
    const condition = conditionData[conditionVariable as keyof typeof conditionData]
    // If condition is matched, then returning true
    if (Number(condition) < conditionValue) return true
    // If not, false
    return false
  }
  if (trigger.tipo == 'INTERVALO_NÚMERICO') {
    // If there's a condition, extracting the conditionns comparators and the condition data to compare
    const conditionVariable = trigger.variavel
    const conditionValueMin = trigger.entre?.minimo || 0
    const conditionValueMax = trigger.entre?.maximo || 0
    const condition = conditionData[conditionVariable as keyof typeof conditionData]
    // If condition is matched, then returning true
    if (Number(condition) >= conditionValueMin && Number(condition) <= conditionValueMax) return true
    // If not, false
    return false
  }
  if (trigger.tipo == 'INCLUI_LISTA') {
    // If there's a condition, extracting the conditionns comparators and the condition data to compare
    const conditionVariable = trigger.variavel
    const conditionValues = trigger.inclui || []
    const condition = conditionData[conditionVariable as keyof typeof conditionData]
    // If condition is matched, then returning true
    if (conditionValues.includes(condition.toString())) return true
    // If not, false
    return false
  }
  return false
}

type GetConditionDataParams = { referenceEntity: TProcessAutomationEntities; referenceEntityData: any }
function getConditionData({ referenceEntity, referenceEntityData }: GetConditionDataParams): TProcessAutomationConditionData | null | undefined {
  try {
    switch (referenceEntity) {
      case 'Project':
        const project = referenceEntityData as TProject
        if (!project) return null
        return {
          projetoAprovado: !!project.aprovacao.dataAprovacao ? 'SIM' : 'NÃO',
          statusContrato: project.contrato.status,
          porcentagemReceitaRecebida: 0,
          pedidoCompraFeito: 'NÃO',
          entregaCompraFeita: 'NÃO',
          ordemServicoConcluida: 'NÃO',
          atividadeConcluida: 'NÃO',
        }
      case 'Revenue':
        const revenue = referenceEntityData as TRevenue
        if (!revenue) return null
        const revenueTotal = revenue.total
        const revenueReceivedTotal = getRevenueReceivedTotal(revenue.recebimentos)
        const revenueReceivedPercentage = revenueReceivedTotal / revenueTotal
        return {
          projetoAprovado: 'NÃO',
          statusContrato: 'N/A',
          porcentagemReceitaRecebida: revenueReceivedPercentage * 100,
          pedidoCompraFeito: 'NÃO',
          entregaCompraFeita: 'NÃO',
          ordemServicoConcluida: 'NÃO',
          atividadeConcluida: 'NÃO',
        }
      case 'Expense':
        return {
          projetoAprovado: 'NÃO',
          statusContrato: 'N/A',
          porcentagemReceitaRecebida: 0,
          pedidoCompraFeito: 'NÃO',
          entregaCompraFeita: 'NÃO',
          ordemServicoConcluida: 'NÃO',
          atividadeConcluida: 'NÃO',
        }
      case 'Purchase':
        const purchase = referenceEntityData as TPurchase
        if (!purchase) return null
        return {
          projetoAprovado: 'NÃO',
          statusContrato: 'N/A',
          porcentagemReceitaRecebida: 0,
          pedidoCompraFeito: !!purchase.dataPedido ? 'SIM' : 'NÃO',
          entregaCompraFeita: !!purchase.entrega.efetivacao ? 'SIM' : 'NÃO',
          ordemServicoConcluida: 'NÃO',
          atividadeConcluida: 'NÃO',
        }
      case 'Comission':
        return {
          projetoAprovado: 'NÃO',
          statusContrato: 'N/A',
          porcentagemReceitaRecebida: 0,
          pedidoCompraFeito: 'NÃO',
          entregaCompraFeita: 'NÃO',
          ordemServicoConcluida: 'NÃO',
          atividadeConcluida: 'NÃO',
        }
      case 'Homologation':
        return {
          projetoAprovado: 'NÃO',
          statusContrato: 'N/A',
          porcentagemReceitaRecebida: 0,
          pedidoCompraFeito: 'NÃO',
          entregaCompraFeita: 'NÃO',
          ordemServicoConcluida: 'NÃO',
          atividadeConcluida: 'NÃO',
        }
      case 'ServiceOrder':
        const serviceOrder = referenceEntityData as TServiceOrder
        if (!serviceOrder) return null
        return {
          projetoAprovado: 'NÃO',
          statusContrato: 'N/A',
          porcentagemReceitaRecebida: 0,
          pedidoCompraFeito: 'NÃO',
          entregaCompraFeita: 'NÃO',
          ordemServicoConcluida: !!serviceOrder.dataEfetivacao ? 'SIM' : 'NÃO',
          atividadeConcluida: 'NÃO',
        }
      case 'Activity':
        const activity = referenceEntityData as TActivity
        if (!activity) return null
        return {
          projetoAprovado: 'NÃO',
          statusContrato: 'N/A',
          porcentagemReceitaRecebida: 0,
          pedidoCompraFeito: 'NÃO',
          entregaCompraFeita: 'NÃO',
          ordemServicoConcluida: 'NÃO',
          atividadeConcluida: !!activity.dataConclusao ? 'SIM' : 'NÃO',
        }
      case 'Notification':
        return {
          projetoAprovado: 'NÃO',
          statusContrato: 'N/A',
          porcentagemReceitaRecebida: 0,
          pedidoCompraFeito: 'NÃO',
          entregaCompraFeita: 'NÃO',
          ordemServicoConcluida: 'NÃO',
          atividadeConcluida: 'NÃO',
        }
      default:
        return null
    }
  } catch (error) {}
}

type GetInsertionReferencesParams = {
  database: Db
  referenceEntity: TProcessAutomationEntities
  referenceEntityId: string
  flowReferences: WithId<TProcessFlowReference>[]
}
async function getInsertionReferences({
  database,
  referenceEntity,
  referenceEntityId,
  flowReferences,
}: GetInsertionReferencesParams): Promise<TInsertionReference[] | undefined> {
  try {
    switch (referenceEntity) {
      case 'Project':
        const projectsCollection: Collection<TProject> = database.collection('projects')
        const project = await projectsCollection.findOne({ _id: new ObjectId(referenceEntityId) })
        if (!project) return []
        const conditionData = getConditionData({ referenceEntity, referenceEntityData: project })
        if (!conditionData) return []
        return flowReferences
          .filter((flowReference) => {
            const trigger = flowReference.ativacao?.gatilho as TProcessFlowTrigger
            const validationResult = validateCondition({ trigger, conditionData: conditionData })
            return validationResult
          })
          .map((flowReference) => {
            const flowId = flowReference._id
            const dependingFlowIds = flowReferences.filter((f) => f.idProcessoReferenciaPai == flowId.toString()).map((f) => f._id)
            const flowReferenceEntity = flowReference.entidade
            const returnEntity = flowReferenceEntity.identificacao as TProcessAutomationEntities
            const returnCustomization = flowReferenceEntity.customizacao
            const data = getProjectToEntity({ project, customization: returnCustomization, newEntity: returnEntity })
            return {
              flowId: flowId,
              dependingFlowIds: dependingFlowIds,
              entity: returnEntity,
              data: data,
            }
          })
          .filter((i) => !!i)
      case 'Activity':
        const activitiesCollection: Collection<TProject> = database.collection('activities')
        const activity = await activitiesCollection.findOne({ _id: new ObjectId(referenceEntityId) })
        if (!activity) return []
        const activityConditionData = getConditionData({ referenceEntity, referenceEntityData: activity })
        if (!activityConditionData) return []
        return flowReferences
          .filter((flowReference) => {
            const trigger = flowReference.ativacao?.gatilho as TProcessFlowTrigger
            const validationResult = validateCondition({ trigger, conditionData: activityConditionData })
            return validationResult
          })
          .map((flowReference) => {
            const flowId = flowReference._id
            const dependingFlowIds = flowReferences.filter((f) => f.idProcessoReferenciaPai == flowId.toString()).map((f) => f._id)
            const flowReferenceEntity = flowReference.entidade
            const returnEntity = flowReferenceEntity.identificacao as TProcessAutomationEntities
            const returnCustomization = flowReferenceEntity.customizacao
            const data = getProjectToEntity({ project, customization: returnCustomization, newEntity: returnEntity })
            return {
              flowId: flowId,
              dependingFlowIds: dependingFlowIds,
              entity: returnEntity,
              data: data,
            }
          })
          .filter((i) => !!i)
    }
    return flowReferences
      .filter((flowReference) => {
        const trigger = flowReference.ativacao?.gatilho as TProcessFlowTrigger
        const validationResult = validateCondition({ trigger, conditionData })
        return validationResult
      })
      .map((flowReference) => {
        const flowId = flowReference._id
        const dependingFlowIds = flowReferences.filter((f) => f.idProcessoReferenciaPai == flowId.toString()).map((f) => f._id)
        const flowReferenceEntity = flowReference.entidade
        const returnEntity = flowReferenceEntity.identificacao as TProcessAutomationEntities
        const returnCustomization = flowReferenceEntity.customizacao
        if (returnEntity == 'Activity') {
          return {
            flowId: flowId,
            dependingFlowIds: dependingFlowIds,
            entity: returnEntity,
            data: getProjectToActivityData({ project, customization: returnCustomization }),
          }
        }

        // Define the returns for every other entity
      })
      .filter((i) => !!i)
  } catch (error) {}
}
type GetInsertionReferenceDataParams = {
  database: Db
  referenceEntity: TProcessAutomationEntities
  referenceEntityId: string
  newEntity: TProcessAutomationEntities
  customization: Record<string, any>
}
async function getInsertionReferenceData({ database, referenceEntity, referenceEntityId, newEntity, customization }: GetInsertionReferenceDataParams) {
  try {
    switch (referenceEntity) {
      case 'Project':
        const projectsCollection: Collection<TProject> = database.collection('projects')
        const project = projectsCollection.findOne({ _id: new ObjectId(referenceEntityId) })
        if (!project) return null
    }
  } catch (error) {}
}
{
  /**
  export async function handleProcessAutomations({ database, projectId, entityToTrack, idToTrack }: HandleProcessAutomationsParams) {
  try {
    const flowReferencesCollection: Collection<TProcessFlowReference> = database.collection('process-flow-references')
    // Defining the query for the non concluded flow references for the projectId
    const flowReferencesQuery: Filter<TProcessFlowReference> = { idProjeto: projectId, dataExecucao: null }
    const allProjectFlowReferences = await getProcessFlowReferences({ collection: flowReferencesCollection, query: flowReferencesQuery })

    // Getting all the pending flow references based on the query
    const flowReferences = allProjectFlowReferences.filter(
      (flowReference) => flowReference.ativacao?.referencia.id == idToTrack && flowReference.ativacao?.referencia.identificacao == entityToTrack
    )
    // If there arent pending flow references to execute, then returning
    if (flowReferences.length == 0) return

    var insertionReferences: { flowId: ObjectId; dependingFlowIds: ObjectId[]; entity: TProcessAutomationEntities; data: any }[] = []
    var bulkWriteReferences = []
    switch (entityToTrack) {
      case 'Project':
        // In case entity to track is Project, getting project data and defining the trigger condition data
        const projectsCollection: Collection<TProject> = database.collection('projects')
        const project = await getProjectByIdWithReferences({ id: idToTrack, collection: projectsCollection, query: {} })
        if (!project) return
        const conditionData: TProcessAutomationConditionData = {
          projetoAprovado: !!project.aprovacao.dataAprovacao ? 'SIM' : 'NÃO',
          statusContrato: project.contrato.status, // PROJECT ENTITY
          porcentagemReceitaRecebida: 0,
          pedidoCompraFeito: 'NÃO',
          entregaCompraFeita: 'NÃO',
          ordemServicoConcluida: 'NÃO',
          atividadeConcluida: 'NÃO',
        }
        // First, filtering the flow references in which their trigger is matched by the current condition data
        // Second, getting the insertion reference and their respective data
        insertionReferences = flowReferences
          .filter((flowReference) => {
            const trigger = flowReference.ativacao?.gatilho as TProcessFlowTrigger
            const validationResult = validateCondition({ trigger, conditionData })
            return validationResult
          })
          .map((flowReference) => {
            const flowId = flowReference._id
            const dependingFlowIds = flowReferences.filter((f) => f.idProcessoReferenciaPai == flowId.toString()).map((f) => f._id)
            const flowReferenceEntity = flowReference.entidade
            const returnEntity = flowReferenceEntity.identificacao as TProcessAutomationEntities
            const returnCustomization = flowReferenceEntity.customizacao
            if (returnEntity == 'Activity') {
              return {
                flowId: flowId,
                dependingFlowIds: dependingFlowIds,
                entity: returnEntity,
                data: getProjectToActivityData({ project, customization: returnCustomization }),
              }
            }

            // Define the returns for every other entity
          })
          .filter((i) => !!i)

      default:
        insertionReferences = insertionReferences
    }

    if (insertionReferences.filter((i) => i.entity == 'Activity').length > 0) {
      // Filtering insertion references by each entity and using the respective collection to insert them
      const activities = insertionReferences.filter((i) => i.entity == 'Activity').map((i) => i.data)
      const activitiesCollection: Collection<TActivity> = database.collection('activities')
      const insertResponse = await activitiesCollection.insertMany(activities)
      // Based on the inserted ids, creating a bulkwrite operator to update each flow that depends them to active from now on
      const insertedIds = Object.values(insertResponse.insertedIds).map((id) => id.toString())
      const dependecyRelations = insertionReferences
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
      bulkWriteReferences = [...bulkWriteReferences, ...dependecyRelations]
    }
    // Create a equivalent script to the above for every other entity

    // Based on the insertion references, updating the executed flows dataExecucao field with the current date
    const flowsToConcludeIds = insertionReferences.map((i) => i.flowId)
    await flowReferencesCollection.updateMany({ _id: { $in: flowsToConcludeIds } }, { $set: { dataExecucao: new Date().toISOString() } })

    // If bulkwriteReferences are non empty, using the bulkWrite method to update flows
    // @ts-ignore
    if (bulkWriteReferences.length > 0) await flowReferencesCollection.bulkWrite(bulkWriteReferences)
    return
  } catch (error) {
    console.log(error)
    throw new createHttpError.InternalServerError('Oops, houve um erro desconhecido ao executar automações.')
  }
}
  
  */
}
