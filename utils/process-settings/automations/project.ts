import { TActivity } from '@/utils/schemas/activities.schema'
import { TProcessFlowReference, TProcessFlowTrigger } from '@/utils/schemas/process-flow-reference.schema'
import { TProject, TProjectWithReferences } from '@/utils/schemas/project.schema'
import { AnyBulkWriteOperation, Collection, Db, Filter, ObjectId, WithId } from 'mongodb'
import { TProcessAutomationEntities } from '..'
import { getProcessFlowReferences } from '@/repositories/process-flows-references/queries'
import { getProjectById, getProjectByIdWithReferences } from '@/repositories/projects/queries'
import { TProcessAutomationConditionData } from '../helpers'
import { TProcessFlowInsertionReference, validateProcessFlowTrigger } from './general'
import { handleActivitiesProcessFlowInsertions } from './activity'
import createHttpError from 'http-errors'
import { TRevenue } from '@/utils/schemas/revenues.schema'
import { TNotification } from '@/utils/schemas/notification.schema'
import { TPurchase } from '@/utils/schemas/purchase.schema'
import { handleRevenuesProcessFlowInsertions } from './revenue'
import { handleNotificationProcessFlowInsertions } from './notification'
import { handlePurchaseProcessFlowInsertions } from './purchase'

type HandleProcessAutomationsByProjectTrackingParams = {
  database: Db
  projectId: string
}
export async function handleProcessAutomationsByProjectTracking({ database, projectId }: HandleProcessAutomationsByProjectTrackingParams) {
  try {
    const flowReferencesCollection: Collection<TProcessFlowReference> = database.collection('process-flow-references')
    // Defining the query for the non concluded flow references for the given project
    const flowReferencesQuery: Filter<TProcessFlowReference> = { idProjeto: projectId, dataExecucao: null }
    const flowReferences = await getProcessFlowReferences({ collection: flowReferencesCollection, query: flowReferencesQuery })

    // If there arent pending flow references to execute, then returning
    if (flowReferences.length == 0) return

    // Getting projects up to date data
    const projectsCollection: Collection<TProject> = database.collection('projects')
    const project = await getProjectById({ id: projectId, collection: projectsCollection, query: {} })
    if (!project) return

    // Defining the condition data to validate triggers
    const conditionData: TProcessAutomationConditionData = {
      projetoAprovado: !!project.aprovacao.dataAprovacao ? 'SIM' : 'NÃO',
      statusContrato: project.contrato.status, // PROJECT ENTITY
      porcentagemReceitaRecebida: 0,
      pedidoCompraFeito: 'NÃO',
      entregaCompraFeita: 'NÃO',
      ordemServicoConcluida: 'NÃO',
      atividadeConcluida: 'NÃO',
    }

    const insertionReferences: TProcessFlowInsertionReference[] = flowReferences
      .filter((flowReference) => flowReference.ativacao?.referencia.id == projectId && flowReference.ativacao?.referencia.identificacao == 'Project')
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

type GetProjectToEntityProps = {
  project: WithId<TProject>
  flowReferenceEntityCustomization: TProcessFlowReference['entidade']['customizacao']
  flowReferenceEntityIdentification: TProcessAutomationEntities
}
export function getProjectToEntity({ project, flowReferenceEntityCustomization, flowReferenceEntityIdentification }: GetProjectToEntityProps) {
  if (flowReferenceEntityIdentification == 'Activity') return getProjectToActivityData({ project, customization: flowReferenceEntityCustomization })
  if (flowReferenceEntityIdentification == 'Revenue') return getProjectToRevenueData({ project, customization: flowReferenceEntityCustomization })
  if (flowReferenceEntityIdentification == 'Notification') return getProjectToNotificationData({ project, customization: flowReferenceEntityCustomization })
  if (flowReferenceEntityIdentification == 'Purchase') return getProjectToPurchase({ project, customization: flowReferenceEntityCustomization })
}
type GetProjectEntityDataProps = {
  project: WithId<TProject>
  customization: TProcessFlowReference['entidade']['customizacao']
}
export function getProjectToActivityData({ project, customization }: GetProjectEntityDataProps) {
  const activity: TActivity = {
    idParceiro: project.idParceiro,
    titulo: customization.titulo, // resume of the activity
    descricao: customization.descricao, // description of what to be done
    responsaveis: customization.responsaveis || project.responsaveis.map((r) => ({ id: r.id, nome: r.nome, avatar_url: r.avatar_url })),
    oportunidade: project.oportunidade,
    projeto: {
      id: project._id.toString(),
      nome: project.nome,
    },
    idHomologacao: project.idHomologacao,
    idAnaliseTecnica: project.idAnaliseTecnica,
    subatividades: [],
    dataVencimento: null,
    dataConclusao: null,
    dataInsercao: new Date().toISOString(),
    autor: {
      id: 'id-holder',
      nome: 'AUTOMAÇÃO',
      avatar_url: null,
    },
  }
  return activity
}
export function getProjectToRevenueData({ project, customization }: GetProjectEntityDataProps) {
  function getReceiptsFromProject({
    paymentFractionment,
    saleTotal,
  }: {
    paymentFractionment: TProject['pagamento']['metodo']['fracionamento']
    saleTotal: number
  }) {
    const receipts: TRevenue['recebimentos'] = paymentFractionment.map((f) => {
      return {
        porcentagem: f.porcentagem,
        valor: (f.porcentagem * saleTotal) / 100,
        metodo: f.metodo,
        efetivado: false,
      }
    })
    return receipts
  }
  const revenue: TRevenue = {
    idParceiro: project.idParceiro,
    titulo: `RECEITA DO PROJETO ${project.nome}`,
    categorias: [project.venda.tipo, project.tipo.titulo],
    projeto: {
      id: project._id.toString(),
      indexador: project.indexador,
      nome: project.nome,
      tipo: project.tipo.titulo,
      identificador: project.identificador,
    },
    composicao: [],
    total: project.valor,
    dataCompetencia: project.contrato.dataAssinatura as string,
    recebimentos: getReceiptsFromProject({ paymentFractionment: project.pagamento.metodo.fracionamento, saleTotal: project.valor }),
    autor: {
      id: 'id-holder',
      nome: 'AUTOMAÇÃO',
      avatar_url: null,
    },
    dataInsercao: new Date().toISOString(),
  }
  return revenue
}
export function getProjectToNotificationData({ project, customization }: GetProjectEntityDataProps) {
  const recipients: TNotification['destinatarios'] =
    customization.destinatarios || project.responsaveis.map((r) => ({ id: r.id, nome: r.nome, avatar_url: r.avatar_url }))
  const notification: TNotification = {
    idParceiro: project.idParceiro,
    remetente: {
      id: null,
      nome: 'SISTEMA',
    },
    destinatarios: recipients,
    oportunidade: {
      id: project.oportunidade.id,
      nome: project.oportunidade.nome,
    },
    mensagem: customization.mensagem || 'AUTOMAÇÃO DE PROJETO CONCLUÍDA',
    recebimentos: [],
    dataInsercao: new Date().toISOString(),
  }
  return notification
}
export function getProjectToPurchase({ project, customization }: GetProjectEntityDataProps) {
  const composition: TPurchase['composicao'] = project.produtos.map((p) => {
    return {
      categoria: p.categoria,
      descricao: `${p.fabricante} ${p.modelo}`,
      unidade: 'UN',
      valor: 0,
      qtde: p.qtde,
    }
  })
  const purchase: TPurchase = {
    titulo: `COMPRA DO PROJETO ${project.nome}`,
    projeto: {
      id: project._id.toString(),
      indexador: project.indexador,
      nome: project.nome,
      tipo: project.tipo.titulo,
      identificador: project.identificador,
    },
    composicao: composition,
    total: 0,
    fornecedor: {
      nome: 'NÃO DEFINIDO',
      contato: '',
    },
    dataLiberacao: new Date().toISOString(),
    entrega: {},
    faturamento: {
      codigoNotaFiscal: '',
    },
    dataInsercao: new Date().toISOString(),
  }
  return purchase
}
