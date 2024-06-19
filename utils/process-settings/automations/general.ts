import { Collection, Db, Filter } from 'mongodb'
import { TProcessAutomationEntities } from '..'
import createHttpError from 'http-errors'
import { TProject } from '@/utils/schemas/project.schema'
import { TProcessFlowReference, TProcessFlowTrigger } from '@/utils/schemas/process-flow-reference.schema'
import { getProcessFlowReferences } from '@/repositories/process-flows-references/queries'
import { getProjectById } from '@/repositories/projects/queries'
import { TProcessAutomationConditionData } from '../helpers'
import { getProjectToActivityData } from './project'
import { TActivity } from '@/utils/schemas/activities.schema'

type HandleProcessAutomationsParams = {
  database: Db
  entityToTrack: TProcessAutomationEntities
  idToTrack: string
}
export async function handleProcessAutomations({ database, entityToTrack, idToTrack }: HandleProcessAutomationsParams) {
  try {
    const flowReferencesCollection: Collection<TProcessFlowReference> = database.collection('process-flow-references')
    // Defining the query for the non concluded flow references based on the entity and its id
    const flowReferencesQuery: Filter<TProcessFlowReference> = {
      'referencia.entidade': entityToTrack,
      'referencia.id': idToTrack,
      dataExecucao: null,
      'retorno.entidade': { $ne: null },
    }
    // Getting all the pending flow references based on the query
    const flowReferences = await getProcessFlowReferences({ collection: flowReferencesCollection, query: flowReferencesQuery })
    // If there arent pending flow references to execute, then returning
    if (flowReferences.length == 0) return

    var insertionReferences: { entity: TProcessAutomationEntities; data: any }[] = []
    switch (entityToTrack) {
      case 'Project':
        const projectsCollection: Collection<TProject> = database.collection('projects')
        const project = await getProjectById({ id: idToTrack, collection: projectsCollection, query: {} })
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
        insertionReferences = flowReferences
          .filter((flowReference) => {
            const trigger = flowReference.gatilho
            const validationResult = validateCondition({ trigger, conditionData })
            return validationResult
          })
          .map((flowReference) => {
            const referenceEntity = entityToTrack
            const flowReferenceReturn = flowReference.retorno
            const returnEntity = flowReferenceReturn.entidade as TProcessAutomationEntities
            const returnCustomization = flowReferenceReturn.customizacao
            if (returnEntity == 'Activity') {
              return { entity: returnEntity, data: getProjectToActivityData({ project, customization: returnCustomization }) }
            }
          })
          .filter((i) => !!i)

      default:
        insertionReferences = insertionReferences
    }
    if (insertionReferences.filter((i) => i.entity == 'Activity').length > 0) {
      const activities = insertionReferences.filter((i) => i.entity == 'Activity').map((i) => i.data)
      const activitiesCollection: Collection<TActivity> = database.collection('activities')
      const insertResponse = await activitiesCollection.insertMany(activities)
      console.log(insertResponse)
    }

    return
  } catch (error) {
    throw new createHttpError.InternalServerError('Oops, houve um erro desconhecido ao executar automações.')
  }
}

type ValidateConditionParams = {
  trigger: TProcessFlowTrigger
  conditionData: TProcessAutomationConditionData
}
function validateCondition({ trigger, conditionData }: ValidateConditionParams) {
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
