import { getDateFromString, getDateIsWithinPeriod, getHoursDiff } from '@/lib/methods/dates'
import connectToAmpereProjectsDatabase from '@/services/mongodb/ampere/projects-db-connection'
import { apiHandler, validateAuthenticationWithSession, validateAuthorization } from '@/utils/api'
import {
  AllProcessTracked,
  CommissioningProcessesIds,
  ContractProcessesIds,
  ExecutionProcessesIds,
  HomologationProcessesIds,
  ProcessTrackedByProjectType,
  SupplyProcessesIds,
} from '@/utils/process-tracking'
import { AppProjectResultsSimplifiedProjection, TAppProject } from '@/utils/schemas/integrations/app-ampere/projects.schema'
import dayjs from 'dayjs'
import createHttpError from 'http-errors'
import { Collection, Filter, WithId } from 'mongodb'
import { NextApiHandler } from 'next'
import { z } from 'zod'

function getContractValue({ system, pa, structure }: { system: number | string; pa: number | string; structure: number | string }) {
  const projeto = !isNaN(Number(system)) ? Number(system) : 0
  const padrao = !isNaN(Number(pa)) ? Number(pa) : 0
  const estrutura = !isNaN(Number(structure)) ? Number(structure) : 0

  return projeto + padrao + estrutura
}

const ProjectTypesTracked = Object.keys(ProcessTrackedByProjectType)

const QuerySchema = z.object({
  projectType: z.string({ required_error: 'Tipo de projeto não fornecido ou inválido.', invalid_type_error: 'Tipo de projeto não fornecido ou inválido.' }),
  after: z
    .string({
      required_error: 'Parâmetros de período não fornecidos ou inválidos.',
      invalid_type_error: 'Parâmetros de período não fornecidos ou inválidos.',
    })
    .datetime({ message: 'Tipo inválido para parâmetro de período.' }),
  before: z
    .string({
      required_error: 'Parâmetros de período não fornecidos ou inválidos.',
      invalid_type_error: 'Parâmetros de período não fornecidos ou inválidos.',
    })
    .datetime({ message: 'Tipo inválido para parâmetro de período.' }),
})

export type TProcessTrackingStats = {
  [key: string]: {
    [key: string]: {
      andamento: number
      concluidos: number
      tempoTotalConclusao: number
    }
  }
}
type GetResponse = {
  data: TProcessTrackingStats
}
const getProcessTrackingStatsRoute: NextApiHandler<GetResponse> = async (req, res) => {
  const session = await validateAuthorization(req, res, 'resultados', 'visualizarOperacional', true)
  const partnerScope = session.user.permissoes.parceiros.escopo
  console.log(req.query)
  const { projectType, after, before } = QuerySchema.parse(req.query)
  if (typeof projectType != 'string') throw new createHttpError.BadRequest('Tipo de projeto selecionado inválido ou não fornecido.')
  if (!(projectType in ProcessTrackedByProjectType)) throw new createHttpError.BadRequest('Tipo de projeto selecionado ainda não possui processos rastreados.')

  const ProjectTypeProcesses = ProcessTrackedByProjectType[projectType as keyof typeof ProcessTrackedByProjectType]
  const db = await connectToAmpereProjectsDatabase(process.env.MONGODB_URI)
  const collection: Collection<TAppProject> = db.collection('dados')
  const afterDate = dayjs(after).startOf('day').subtract(3, 'hour').toDate()
  const beforeDate = dayjs(before).endOf('day').subtract(3, 'hour').toDate()

  const afterDateStr = afterDate.toISOString()
  const beforeDateStr = beforeDate.toISOString()
  console.log(afterDateStr, beforeDateStr)
  const partnerQuery = partnerScope ? { idParceiro: { $in: [...partnerScope] } } : {}
  // const orQuery: Filter<TAppProject> = {
  //   $or: [
  //     { $and: [{ 'contrato.dataSolicitacao': { $gte: afterDateStr } }, { 'contrato.dataSolicitacao': { $lte: beforeDateStr } }] },
  //     { $and: [{ 'contrato.dataLiberacao': { $gte: afterDateStr } }, { 'contrato.dataLiberacao': { $lte: beforeDateStr } }] },
  //     { $and: [{ 'contrato.dataAssinatura': { $gte: afterDateStr } }, { 'contrato.dataAssinatura': { $lte: beforeDateStr } }] },
  //     { $and: [{ 'homologacao.dataLiberacao': { $gte: afterDateStr } }, { 'homologacao.dataLiberacao': { $lte: beforeDateStr } }] },
  //     {
  //       $and: [
  //         { 'homologacao.documentacao.dataInicioElaboracao': { $gte: afterDateStr } },
  //         { 'homologacao.documentacao.dataInicioElaboracao': { $lte: beforeDateStr } },
  //       ],
  //     },
  //     {
  //       $and: [
  //         { 'homologacao.documentacao.dataConclusaoElaboracao': { $gte: afterDateStr } },
  //         { 'homologacao.documentacao.dataConclusaoElaboracao': { $lte: beforeDateStr } },
  //       ],
  //     },
  //     {
  //       $and: [
  //         { 'homologacao.documentacao.dataConclusaoElaboracao': { $gte: afterDateStr } },
  //         { 'homologacao.documentacao.dataConclusaoElaboracao': { $lte: beforeDateStr } },
  //       ],
  //     },
  //     {
  //       $and: [{ 'homologacao.acesso.dataSolicitacao': { $gte: afterDateStr } }, { 'homologacao.acesso.dataSolicitacao': { $lte: beforeDateStr } }],
  //     },
  //     {
  //       $and: [{ 'homologacao.acesso.dataResposta': { $gte: afterDateStr } }, { 'homologacao.acesso.dataResposta': { $lte: beforeDateStr } }],
  //     },
  //     {
  //       $and: [{ 'homologacao.vistoria.dataSolicitacao': { $gte: afterDateStr } }, { 'homologacao.vistoria.dataSolicitacao': { $lte: beforeDateStr } }],
  //     },
  //     {
  //       $and: [{ 'homologacao.vistoria.dataEfetivacao': { $gte: afterDateStr } }, { 'homologacao.vistoria.dataEfetivacao': { $lte: beforeDateStr } }],
  //     },
  //     {
  //       $and: [{ 'compra.dataLiberacao': { $gte: afterDateStr } }, { 'compra.dataLiberacao': { $lte: beforeDateStr } }],
  //     },
  //     {
  //       $and: [{ 'compra.dataPedido': { $gte: afterDateStr } }, { 'compra.dataPedido': { $lte: beforeDateStr } }],
  //     },
  //     {
  //       $and: [{ 'compra.dataEntrega': { $gte: afterDateStr } }, { 'compra.dataEntrega': { $lte: beforeDateStr } }],
  //     },
  //     {
  //       $and: [{ 'obra.entrada': { $gte: afterDateStr } }, { 'obra.entrada': { $lte: beforeDateStr } }],
  //     },
  //     {
  //       $and: [{ 'obra.saida': { $gte: afterDateStr } }, { 'obra.saida': { $lte: beforeDateStr } }],
  //     },
  //   ],
  // }
  const orQuery: Filter<TAppProject> = {
    $or: [
      { 'contrato.dataSolicitacao': { $gte: afterDateStr, $lte: beforeDateStr } },
      // In FORMULAÇÃO DE CONTRATO phase
      { $and: [{ 'contrato.dataSolicitacao': { $ne: null } }, { 'contrato.dataLiberacao': null }] },
      { 'contrato.dataLiberacao': { $gte: afterDateStr, $lte: beforeDateStr } },
      // In COLETA DE ASSINATURA DO CONTRATO phase
      { $and: [{ 'contrato.dataLiberacao': { $ne: null } }, { 'contrato.dataAssinatura': null }] },
      { 'contrato.dataAssinatura': { $gte: afterDateStr, $lte: beforeDateStr } },
      { 'homologacao.dataLiberacao': { $gte: afterDateStr, $lte: beforeDateStr } },
      // In INICIAÇÃO DE PROJETO phase
      { $and: [{ 'homologacao.dataLiberacao': { $ne: null } }, { 'homologacao.documentacao.dataInicioElaboracao': null }] },
      { 'homologacao.documentacao.dataInicioElaboracao': { $gte: afterDateStr, $lte: beforeDateStr } },
      // In ELABORAÇÃO DA DOCUMENTAÇÃO phase
      { $and: [{ 'homologacao.documentacao.dataInicioElaboracao': { $ne: null } }, { 'homologacao.documentacao.dataConclusaoElaboracao': null }] },
      { 'homologacao.documentacao.dataConclusaoElaboracao': { $gte: afterDateStr, $lte: beforeDateStr } },
      // In SOLICITAÇÃO DE ACESSO A CONCESSIONÁRIA phase
      { $and: [{ 'homologacao.documentacao.dataConclusaoElaboracao': { $ne: null } }, { 'homologacao.acesso.dataSolicitacao': null }] },
      { 'homologacao.acesso.dataSolicitacao': { $gte: afterDateStr, $lte: beforeDateStr } },
      // In APROVAÇÃO DA CONCESSIONÁRIA phase
      { $and: [{ 'homologacao.acesso.dataSolicitacao': { $ne: null } }, { 'homologacao.acesso.dataResposta': null }] },
      { 'homologacao.acesso.dataResposta': { $gte: afterDateStr, $lte: beforeDateStr } },
      // In SOLICITAÇÃO DE VISTORIA phase
      { $and: [{ 'obra.saida': { $ne: null } }, { 'homologacao.vistoria.dataSolicitacao': null }] },
      { 'homologacao.vistoria.dataSolicitacao': { $gte: afterDateStr, $lte: beforeDateStr } },
      // In APROVAÇÃO DA VISTORIA phase
      { $and: [{ 'homologacao.vistoria.dataSolicitacao': { $ne: null } }, { 'homologacao.vistoria.dataEfetivacao': null }] },
      { 'homologacao.vistoria.dataEfetivacao': { $gte: afterDateStr, $lte: beforeDateStr } },
      // In LIBERAÇÃO PARA COMPRA phase
      { $and: [{ 'contrato.dataAssinatura': { $ne: null } }, { 'compra.dataLiberacao': null }] },
      { 'compra.dataLiberacao': { $gte: afterDateStr, $lte: beforeDateStr } },
      // In COMPRA DE PRODUTOS phase
      { $and: [{ 'compra.dataLiberacao': { $ne: null } }, { 'compra.dataPedido': null }] },
      { 'compra.dataPedido': { $gte: afterDateStr, $lte: beforeDateStr } },
      // In ENTREGA DE PRODUTOS phase
      { $and: [{ 'compra.dataPedido': { $ne: null } }, { 'compra.dataEntrega': null }] },
      { 'compra.dataEntrega': { $gte: afterDateStr, $lte: beforeDateStr } },
      // In PLANEJAMENTO PÓS ENTREGA PARA EXECUÇÃO phase
      { $and: [{ 'compra.dataEntrega': { $ne: null } }, { 'obra.entrada': null }] },
      // In PLANEJAMENTO PÓS CONTRATO PARA EXECUÇÃO phase
      { $and: [{ 'contrato.dataAssinatura': { $ne: null } }, { 'obra.entrada': null }] },
      { 'obra.entrada': { $gte: afterDateStr, $lte: beforeDateStr } },
      // In EXECUÇÃO phase
      { $and: [{ 'obra.entrada': { $ne: null } }, { 'obra.saida': null }] },
      { 'obra.saida': { $gte: afterDateStr, $lte: beforeDateStr } },
    ],
  }
  const query = { ...partnerQuery, ...orQuery }

  const projects = await getSimplifiedProjects({ collection, query })
  console.log('PROJETOS ENCONTRADOS', projects.length)
  const reduced = projects.reduce((acc: TProcessTrackingStats, current) => {
    // Checking for tracking of Contract related processes for the given project types
    if (ProjectTypeProcesses.some((p) => ContractProcessesIds.includes(p))) {
      if (!acc['CONTRATOS']) acc['CONTRATOS'] = {}
      const contractSolicitationDate = getDateFromString(current.contrato.dataSolicitacao)
      const contractLiberationDate = getDateFromString(current.contrato.dataLiberacao)
      const contractSignatureDate = getDateFromString(current.contrato.dataAssinatura)

      if (ProjectTypeProcesses.includes('contract_formulation')) {
        if (!acc['CONTRATOS']['COLETA DE ASSINATURA DO CONTRATO'])
          acc['CONTRATOS']['FORMULAÇÃO DE CONTRATO'] = { concluidos: 0, andamento: 0, tempoTotalConclusao: 0 }
        const isInFormulation = !!contractSolicitationDate && !contractLiberationDate
        if (isInFormulation) acc['CONTRATOS']['FORMULAÇÃO DE CONTRATO'].andamento += 1

        const wasFormulatedWithinPeriod = getDateIsWithinPeriod({ date: contractLiberationDate, after: afterDate, before: beforeDate })
        if (wasFormulatedWithinPeriod) {
          const time =
            contractSolicitationDate && contractLiberationDate ? getHoursDiff({ start: contractSolicitationDate, finish: contractLiberationDate }) || 8 : 0

          acc['CONTRATOS']['FORMULAÇÃO DE CONTRATO'].concluidos += 1
          acc['CONTRATOS']['FORMULAÇÃO DE CONTRATO'].tempoTotalConclusao += time
        }
      }
      if (ProjectTypeProcesses.includes('contract_signature_collection')) {
        if (!acc['CONTRATOS']['COLETA DE ASSINATURA DO CONTRATO'])
          acc['CONTRATOS']['COLETA DE ASSINATURA DO CONTRATO'] = { concluidos: 0, andamento: 0, tempoTotalConclusao: 0 }
        const isInSignatureCollection = !!contractLiberationDate && !contractSignatureDate
        if (isInSignatureCollection) acc['CONTRATOS']['COLETA DE ASSINATURA DO CONTRATO'].andamento += 1

        const wasSignedWithinPeriod = getDateIsWithinPeriod({ date: contractSignatureDate, after: afterDate, before: beforeDate })
        if (wasSignedWithinPeriod) {
          const time = contractLiberationDate && contractSignatureDate ? getHoursDiff({ start: contractLiberationDate, finish: contractSignatureDate }) || 8 : 0

          acc['CONTRATOS']['COLETA DE ASSINATURA DO CONTRATO'].concluidos += 1
          acc['CONTRATOS']['COLETA DE ASSINATURA DO CONTRATO'].tempoTotalConclusao += time
        }
      }
    }
    if (ProjectTypeProcesses.some((p) => HomologationProcessesIds.includes(p))) {
      if (!acc['HOMOLOGAÇÃO']) acc['HOMOLOGAÇÃO'] = {}
      const homologationLiberationDate = getDateFromString(current.homologacao.dataLiberacao)
      const homologationElaborationStartDate = getDateFromString(current.homologacao.dataInicioElaboracao)
      const homologationElaborationEndDate = getDateFromString(current.homologacao.dataConclusaoElaboracao)
      const homologationAccessRequestDate = getDateFromString(current.homologacao.dataSolicitacaoAcesso)
      const homologationAccessResponseDate = getDateFromString(current.homologacao.dataRespostaAcesso)

      const executionEndDate = getDateFromString(current.execucao.fim)

      const homologationVistoryRequestDate = getDateFromString(current.homologacao.dataSolicitacaoVistoria)
      const homologationVistoryApprovalDate = getDateFromString(current.homologacao.dataEfetivacaoVistoria)

      if (ProjectTypeProcesses.includes('homologation_initiation')) {
        if (!acc['HOMOLOGAÇÃO']['INICIAÇÃO DE PROJETO']) acc['HOMOLOGAÇÃO']['INICIAÇÃO DE PROJETO'] = { andamento: 0, concluidos: 0, tempoTotalConclusao: 0 }
        const isInHomologationInitiation = !!homologationLiberationDate && !homologationElaborationStartDate
        if (isInHomologationInitiation) acc['HOMOLOGAÇÃO']['INICIAÇÃO DE PROJETO'].andamento += 1
        const wasInitiatedWithinPeriod = getDateIsWithinPeriod({ date: homologationElaborationStartDate, after: afterDate, before: beforeDate })
        if (wasInitiatedWithinPeriod) {
          const time =
            homologationLiberationDate && homologationElaborationStartDate
              ? getHoursDiff({ start: homologationLiberationDate, finish: homologationElaborationStartDate }) || 8
              : 0

          acc['HOMOLOGAÇÃO']['INICIAÇÃO DE PROJETO'].concluidos += 1
          acc['HOMOLOGAÇÃO']['INICIAÇÃO DE PROJETO'].tempoTotalConclusao += time
        }
      }
      if (ProjectTypeProcesses.includes('homologation_documents_elaboration')) {
        if (!acc['HOMOLOGAÇÃO']['ELABORAÇÃO DA DOCUMENTAÇÃO'])
          acc['HOMOLOGAÇÃO']['ELABORAÇÃO DA DOCUMENTAÇÃO'] = { andamento: 0, concluidos: 0, tempoTotalConclusao: 0 }
        const isInHomologationElaboration = !!homologationElaborationStartDate && !homologationElaborationEndDate
        if (isInHomologationElaboration) acc['HOMOLOGAÇÃO']['ELABORAÇÃO DA DOCUMENTAÇÃO'].andamento += 1
        const wasElaboratedWithinPeriod = getDateIsWithinPeriod({ date: homologationElaborationEndDate, after: afterDate, before: beforeDate })
        if (wasElaboratedWithinPeriod) {
          const time =
            homologationElaborationStartDate && homologationElaborationEndDate
              ? getHoursDiff({ start: homologationElaborationStartDate, finish: homologationElaborationEndDate }) || 8
              : 0

          acc['HOMOLOGAÇÃO']['ELABORAÇÃO DA DOCUMENTAÇÃO'].concluidos += 1
          acc['HOMOLOGAÇÃO']['ELABORAÇÃO DA DOCUMENTAÇÃO'].tempoTotalConclusao += time
        }
      }
      if (ProjectTypeProcesses.includes('homologation_access_request')) {
        if (!acc['HOMOLOGAÇÃO']['SOLICITAÇÃO DE ACESSO A CONCESSIONÁRIA'])
          acc['HOMOLOGAÇÃO']['SOLICITAÇÃO DE ACESSO A CONCESSIONÁRIA'] = { andamento: 0, concluidos: 0, tempoTotalConclusao: 0 }
        const isInHomologationAccessRequest = !!homologationElaborationEndDate && !homologationAccessRequestDate
        if (isInHomologationAccessRequest) acc['HOMOLOGAÇÃO']['SOLICITAÇÃO DE ACESSO A CONCESSIONÁRIA'].andamento += 1
        const wasRequestedAccessWithinPeriod = getDateIsWithinPeriod({ date: homologationAccessRequestDate, after: afterDate, before: beforeDate })
        if (wasRequestedAccessWithinPeriod) {
          const time =
            homologationElaborationEndDate && homologationAccessRequestDate
              ? getHoursDiff({ start: homologationElaborationEndDate, finish: homologationAccessRequestDate }) || 8
              : 0

          acc['HOMOLOGAÇÃO']['SOLICITAÇÃO DE ACESSO A CONCESSIONÁRIA'].concluidos += 1
          acc['HOMOLOGAÇÃO']['SOLICITAÇÃO DE ACESSO A CONCESSIONÁRIA'].tempoTotalConclusao += time
        }
      }
      if (ProjectTypeProcesses.includes('homologation_access_approval')) {
        if (!acc['HOMOLOGAÇÃO']['APROVAÇÃO DA CONCESSIONÁRIA'])
          acc['HOMOLOGAÇÃO']['APROVAÇÃO DA CONCESSIONÁRIA'] = { andamento: 0, concluidos: 0, tempoTotalConclusao: 0 }
        const isInHomologationAccessApproval = !!homologationAccessRequestDate && !homologationAccessResponseDate
        if (isInHomologationAccessApproval) acc['HOMOLOGAÇÃO']['APROVAÇÃO DA CONCESSIONÁRIA'].andamento += 1
        const wasApprovedAccessWithinPeriod = getDateIsWithinPeriod({ date: homologationAccessResponseDate, after: afterDate, before: beforeDate })
        if (wasApprovedAccessWithinPeriod) {
          const time =
            homologationAccessRequestDate && homologationAccessResponseDate
              ? getHoursDiff({ start: homologationAccessRequestDate, finish: homologationAccessResponseDate }) || 8
              : 0

          acc['HOMOLOGAÇÃO']['APROVAÇÃO DA CONCESSIONÁRIA'].concluidos += 1
          acc['HOMOLOGAÇÃO']['APROVAÇÃO DA CONCESSIONÁRIA'].tempoTotalConclusao += time
        }
      }
    }
    if (ProjectTypeProcesses.some((p) => SupplyProcessesIds.includes(p))) {
      if (!acc['SUPRIMENTAÇÃO']) acc['SUPRIMENTAÇÃO'] = {}
      const contractSignatureDate = getDateFromString(current.contrato.dataAssinatura)

      const supplyLiberationDate = getDateFromString(current.compra.dataLiberacao)
      const supplyOrderDate = getDateFromString(current.compra.dataPedido)
      const supplyDeliveryDate = getDateFromString(current.compra.dataEntrega)

      if (ProjectTypeProcesses.includes('supplementation_release')) {
        if (!acc['SUPRIMENTAÇÃO']['LIBERAÇÃO PARA COMPRA'])
          acc['SUPRIMENTAÇÃO']['LIBERAÇÃO PARA COMPRA'] = { andamento: 0, concluidos: 0, tempoTotalConclusao: 0 }
        const isInSupplyLiberation = !!contractSignatureDate && !supplyLiberationDate
        if (isInSupplyLiberation) acc['SUPRIMENTAÇÃO']['LIBERAÇÃO PARA COMPRA'].andamento += 1
        const wasReleasedForSupplyWithinPeriod = getDateIsWithinPeriod({ date: supplyLiberationDate, after: afterDate, before: beforeDate })
        if (wasReleasedForSupplyWithinPeriod) {
          const time = contractSignatureDate && supplyLiberationDate ? getHoursDiff({ start: contractSignatureDate, finish: supplyLiberationDate }) || 8 : 0

          acc['SUPRIMENTAÇÃO']['LIBERAÇÃO PARA COMPRA'].concluidos += 1
          acc['SUPRIMENTAÇÃO']['LIBERAÇÃO PARA COMPRA'].tempoTotalConclusao += time
        }
      }
      if (ProjectTypeProcesses.includes('supplementation_order')) {
        if (!acc['SUPRIMENTAÇÃO']['COMPRA DE PRODUTOS']) acc['SUPRIMENTAÇÃO']['COMPRA DE PRODUTOS'] = { andamento: 0, concluidos: 0, tempoTotalConclusao: 0 }
        const isInSupplyOrder = !!supplyLiberationDate && !supplyOrderDate
        if (isInSupplyOrder) acc['SUPRIMENTAÇÃO']['COMPRA DE PRODUTOS'].andamento += 1
        const wasOrderedWithinPeriod = getDateIsWithinPeriod({ date: supplyOrderDate, after: afterDate, before: beforeDate })
        if (wasOrderedWithinPeriod) {
          const time = supplyLiberationDate && supplyOrderDate ? getHoursDiff({ start: supplyLiberationDate, finish: supplyOrderDate }) || 8 : 0

          acc['SUPRIMENTAÇÃO']['COMPRA DE PRODUTOS'].concluidos += 1
          acc['SUPRIMENTAÇÃO']['COMPRA DE PRODUTOS'].tempoTotalConclusao += time
        }
      }
      if (ProjectTypeProcesses.includes('supplementation_delivery')) {
        if (!acc['SUPRIMENTAÇÃO']['ENTREGA DE PRODUTOS']) acc['SUPRIMENTAÇÃO']['ENTREGA DE PRODUTOS'] = { andamento: 0, concluidos: 0, tempoTotalConclusao: 0 }
        const inInSupplyDelivery = !!supplyOrderDate && !supplyDeliveryDate
        if (inInSupplyDelivery) acc['SUPRIMENTAÇÃO']['ENTREGA DE PRODUTOS'].andamento += 1
        const wasDeliveredWithinPeriod = getDateIsWithinPeriod({ date: supplyDeliveryDate, after: afterDate, before: beforeDate })
        if (wasDeliveredWithinPeriod) {
          const time = supplyOrderDate && supplyDeliveryDate ? getHoursDiff({ start: supplyOrderDate, finish: supplyDeliveryDate }) || 8 : 0

          acc['SUPRIMENTAÇÃO']['ENTREGA DE PRODUTOS'].concluidos += 1
          acc['SUPRIMENTAÇÃO']['ENTREGA DE PRODUTOS'].tempoTotalConclusao += time
        }
      }
    }
    if (ProjectTypeProcesses.some((p) => ExecutionProcessesIds.includes(p))) {
      if (!acc['EXECUÇÃO']) acc['EXECUÇÃO'] = {}
      const contractSignatureDate = getDateFromString(current.contrato.dataAssinatura)
      const supplyDeliveryDate = getDateFromString(current.compra.dataEntrega)

      const executionStartDate = getDateFromString(current.execucao.inicio)
      const executionEndDate = getDateFromString(current.execucao.fim)

      if (ProjectTypeProcesses.includes('execution_planning_post_delivery')) {
        if (!acc['EXECUÇÃO']['PLANEJAMENTO PÓS ENTREGA PARA EXECUÇÃO'])
          acc['EXECUÇÃO']['PLANEJAMENTO PÓS ENTREGA PARA EXECUÇÃO'] = { andamento: 0, concluidos: 0, tempoTotalConclusao: 0 }

        const isInExecutionPlanningPosDelivery = !!supplyDeliveryDate && !executionStartDate
        if (isInExecutionPlanningPosDelivery) acc['EXECUÇÃO']['PLANEJAMENTO PÓS ENTREGA PARA EXECUÇÃO'].andamento += 1
        const wasStartedExecutionWithinPeriod = getDateIsWithinPeriod({ date: executionStartDate, after: afterDate, before: beforeDate })
        if (wasStartedExecutionWithinPeriod) {
          const time = supplyDeliveryDate && executionStartDate ? getHoursDiff({ start: supplyDeliveryDate, finish: executionStartDate }) || 8 : 0

          acc['EXECUÇÃO']['PLANEJAMENTO PÓS ENTREGA PARA EXECUÇÃO'].concluidos += 1
          acc['EXECUÇÃO']['PLANEJAMENTO PÓS ENTREGA PARA EXECUÇÃO'].tempoTotalConclusao += time
        }
      }
      if (ProjectTypeProcesses.includes('execution_planning_post_contract')) {
        if (!acc['EXECUÇÃO']['PLANEJAMENTO PÓS CONTRATO PARA EXECUÇÃO'])
          acc['EXECUÇÃO']['PLANEJAMENTO PÓS CONTRATO PARA EXECUÇÃO'] = { andamento: 0, concluidos: 0, tempoTotalConclusao: 0 }

        const isInExecutionPlanningPosContractSigning = !!contractSignatureDate && !executionStartDate
        if (isInExecutionPlanningPosContractSigning) acc['EXECUÇÃO']['PLANEJAMENTO PÓS CONTRATO PARA EXECUÇÃO'].andamento += 1
        const wasStartedExecutionWithinPeriod = getDateIsWithinPeriod({ date: executionStartDate, after: afterDate, before: beforeDate })
        if (wasStartedExecutionWithinPeriod) {
          const time = contractSignatureDate && executionStartDate ? getHoursDiff({ start: contractSignatureDate, finish: executionStartDate }) || 8 : 0

          acc['EXECUÇÃO']['PLANEJAMENTO PÓS CONTRATO PARA EXECUÇÃO'].concluidos += 1
          acc['EXECUÇÃO']['PLANEJAMENTO PÓS CONTRATO PARA EXECUÇÃO'].tempoTotalConclusao += time
        }
      }
      if (ProjectTypeProcesses.includes('execution')) {
        if (!acc['EXECUÇÃO']['EXECUÇÃO']) acc['EXECUÇÃO']['EXECUÇÃO'] = { andamento: 0, concluidos: 0, tempoTotalConclusao: 0 }

        const isInExecution = !!executionStartDate && !executionEndDate
        if (isInExecution) acc['EXECUÇÃO']['EXECUÇÃO'].andamento += 1
        const wasExecutedWithinPeriod = getDateIsWithinPeriod({ date: executionEndDate, after: afterDate, before: beforeDate })
        if (wasExecutedWithinPeriod) {
          const time = executionStartDate && executionEndDate ? getHoursDiff({ start: executionStartDate, finish: executionEndDate }) || 8 : 0

          acc['EXECUÇÃO']['EXECUÇÃO'].concluidos += 1
          acc['EXECUÇÃO']['EXECUÇÃO'].tempoTotalConclusao += time
        }
      }
    }
    if (ProjectTypeProcesses.some((p) => CommissioningProcessesIds.includes(p))) {
      if (!acc['COMISSIONAMENTO']) acc['COMISSIONAMENTO'] = {}

      const executionEndDate = getDateFromString(current.execucao.fim)

      const homologationVistoryRequestDate = getDateFromString(current.homologacao.dataSolicitacaoVistoria)
      const homologationVistoryApprovalDate = getDateFromString(current.homologacao.dataEfetivacaoVistoria)
      if (ProjectTypeProcesses.includes('homologation_vistory_request')) {
        if (!acc['COMISSIONAMENTO']['SOLICITAÇÃO DE VISTORIA'])
          acc['COMISSIONAMENTO']['SOLICITAÇÃO DE VISTORIA'] = { andamento: 0, concluidos: 0, tempoTotalConclusao: 0 }
        const isInHomologationVistoryRequest = !!executionEndDate && !homologationVistoryRequestDate
        if (isInHomologationVistoryRequest) acc['COMISSIONAMENTO']['SOLICITAÇÃO DE VISTORIA'].andamento += 1
        const wasRequestedVistoryWithinPeriod = getDateIsWithinPeriod({ date: homologationVistoryRequestDate, after: afterDate, before: beforeDate })
        if (wasRequestedVistoryWithinPeriod) {
          const time =
            executionEndDate && homologationVistoryRequestDate ? getHoursDiff({ start: executionEndDate, finish: homologationVistoryRequestDate }) || 8 : 0

          acc['COMISSIONAMENTO']['SOLICITAÇÃO DE VISTORIA'].concluidos += 1
          acc['COMISSIONAMENTO']['SOLICITAÇÃO DE VISTORIA'].tempoTotalConclusao += time
        }
      }
      if (ProjectTypeProcesses.includes('homologation_vistory_approval')) {
        if (!acc['COMISSIONAMENTO']['APROVAÇÃO DA VISTORIA'])
          acc['COMISSIONAMENTO']['APROVAÇÃO DA VISTORIA'] = { andamento: 0, concluidos: 0, tempoTotalConclusao: 0 }
        const isInHomologationVistoryApproval = !!homologationVistoryRequestDate && !homologationVistoryApprovalDate
        if (isInHomologationVistoryApproval) acc['COMISSIONAMENTO']['APROVAÇÃO DA VISTORIA'].andamento += 1
        const wasApprovedVistoryWithinPeriod = getDateIsWithinPeriod({ date: homologationVistoryApprovalDate, after: afterDate, before: beforeDate })
        if (wasApprovedVistoryWithinPeriod) {
          const time =
            homologationVistoryRequestDate && homologationVistoryApprovalDate
              ? getHoursDiff({ start: homologationVistoryRequestDate, finish: homologationVistoryApprovalDate }) || 8
              : 0

          acc['COMISSIONAMENTO']['APROVAÇÃO DA VISTORIA'].concluidos += 1
          acc['COMISSIONAMENTO']['APROVAÇÃO DA VISTORIA'].tempoTotalConclusao += time
        }
      }
    }
    return acc
  }, {})
  return res.status(200).json({ data: reduced })
}
export default apiHandler({ GET: getProcessTrackingStatsRoute })

type TSimplifiedProjectResult = {
  id: string
  indexador: number
  nome: string
  identificador: string | number
  cidade: TAppProject['cidade']
  idParceiro: TAppProject['idParceiro']
  idProjetoCRM: TAppProject['idProjetoCRM']
  potenciaPico: TAppProject['sistema']['potPico']
  valor: number
  contrato: {
    dataLiberacao: TAppProject['contrato']['dataLiberacao']
    dataSolicitacao: TAppProject['contrato']['dataSolicitacao']
    dataAssinatura: TAppProject['contrato']['dataAssinatura']
  }
  homologacao: {
    dataLiberacao: TAppProject['homologacao']['dataLiberacao']
    dataInicioElaboracao: TAppProject['homologacao']['documentacao']['dataInicioElaboracao']
    dataConclusaoElaboracao: TAppProject['homologacao']['documentacao']['dataConclusaoElaboracao']
    dataSolicitacaoAcesso: TAppProject['homologacao']['acesso']['dataSolicitacao']
    dataRespostaAcesso: TAppProject['homologacao']['acesso']['dataResposta']
    dataSolicitacaoVistoria: TAppProject['homologacao']['vistoria']['dataSolicitacao']
    dataEfetivacaoVistoria: TAppProject['homologacao']['vistoria']['dataEfetivacao']
  }
  compra: {
    dataLiberacao: TAppProject['compra']['dataLiberacao']
    dataPedido: TAppProject['compra']['dataPedido']
    dataEntrega: TAppProject['compra']['dataEntrega']
  }
  execucao: {
    inicio: TAppProject['obra']['entrada']
    fim: TAppProject['obra']['saida']
  }
}

type GetSimplifiedProjectsProps = {
  collection: Collection<TAppProject>
  query: Filter<TAppProject>
}
async function getSimplifiedProjects({ collection, query }: GetSimplifiedProjectsProps) {
  try {
    const match = { 'contrato.status': { $ne: 'RESCISÃO DE CONTRATO' }, ...query }
    // console.log(JSON.stringify(match))
    const projection = AppProjectResultsSimplifiedProjection

    const result = await collection.find({ ...match }, { projection: projection }).toArray()
    const projects: TSimplifiedProjectResult[] = result.map((project) => {
      const info = project as WithId<TAppProject>
      return {
        id: info._id.toString(),
        indexador: info.qtde,
        nome: info.nomeDoContrato,
        identificador: info.codigoSVB,
        cidade: info.cidade,
        idParceiro: info.idParceiro,
        idProjetoCRM: info.idProjetoCRM,
        potenciaPico: info.sistema.potPico,
        valor: getContractValue({ system: info.sistema.valorProjeto || 0, pa: info.padrao.valor || 0, structure: info.estruturaPersonalizada.valor || 0 }),
        contrato: {
          dataSolicitacao: info.contrato.dataSolicitacao,
          dataLiberacao: info.contrato.dataLiberacao,
          dataAssinatura: info.contrato.dataAssinatura,
        },
        homologacao: {
          dataLiberacao: info.homologacao.dataLiberacao,
          dataInicioElaboracao: info.homologacao.documentacao.dataInicioElaboracao,
          dataConclusaoElaboracao: info.homologacao.documentacao.dataConclusaoElaboracao,
          dataSolicitacaoAcesso: info.homologacao.acesso.dataSolicitacao,
          dataRespostaAcesso: info.homologacao.acesso.dataResposta,
          dataSolicitacaoVistoria: info.homologacao.vistoria.dataSolicitacao,
          dataEfetivacaoVistoria: info.homologacao.vistoria.dataEfetivacao,
        },
        compra: {
          dataLiberacao: info.compra.dataLiberacao,
          dataPedido: info.compra.dataPedido,
          dataEntrega: info.compra.dataEntrega,
        },
        execucao: {
          inicio: info.obra.entrada,
          fim: info.obra.saida,
        },
      }
    })

    return projects
  } catch (error) {
    throw error
  }
}
