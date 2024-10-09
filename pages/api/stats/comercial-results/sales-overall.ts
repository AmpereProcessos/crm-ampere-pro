import connectToDatabase from '@/services/mongodb/crm-db-connection'
import { apiHandler, validateAuthorization } from '@/utils/api'
import { TClient } from '@/utils/schemas/client.schema'
import { TOpportunity } from '@/utils/schemas/opportunity.schema'

import { TProposal } from '@/utils/schemas/proposal.schema'
import { GeneralStatsFiltersSchema, ResponsiblesBodySchema } from '@/utils/schemas/stats.schema'

import { TUser } from '@/utils/schemas/user.schema'
import dayjs from 'dayjs'
import createHttpError from 'http-errors'
import { Collection, Filter, WithId } from 'mongodb'
import { NextApiHandler } from 'next'
import { z } from 'zod'

export type TOverallResults = {
  projetosCriados: {
    inbound: number
    outboundVendedor: number
    outboundSdr: number
    total: number
  }
  projetosGanhos: {
    inbound: number
    outboundVendedor: number
    outboundSdr: number
    total: number
  }
  projetosPerdidos: {
    inbound: number
    outboundVendedor: number
    outboundSdr: number
    total: number
  }
  totalVendido: {
    inbound: number
    outboundVendedor: number
    outboundSdr: number
    total: number
  }
  perdasPorMotivo: {
    [key: string]: number
  }
  porCanalAquisicao: {
    [key: string]: {
      adquiridos: number
      ganhos: number
    }
  }
}
type GetResponse = {
  data: TOverallResults
}

const QueryDatesSchema = z.object({
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
const getOverallResults: NextApiHandler<GetResponse> = async (req, res) => {
  const session = await validateAuthorization(req, res, 'resultados', 'visualizarComercial', true)
  const partnerId = session.user.idParceiro
  const partnerScope = session.user.permissoes.parceiros.escopo

  const userId = session.user.id
  const userScope = session.user.permissoes.resultados.escopo
  const { after, before } = QueryDatesSchema.parse(req.query)
  const { responsibles, partners, projectTypes } = GeneralStatsFiltersSchema.parse(req.body)

  // If user has a scope defined and in the request there isnt a responsible arr defined, then user is trying
  // to access a overall visualiation, which he/she isnt allowed
  if (!!userScope && !responsibles) throw new createHttpError.Unauthorized('Seu usuário não possui solicitação para esse escopo de visualização.')

  // If user has a scope defined and in the request there isnt a partners arr defined, then user is trying
  // to access a overall visualiation, which he/she isnt allowed
  if (!!partnerScope && !partners) throw new createHttpError.Unauthorized('Seu usuário não possui solicitação para esse escopo de visualização.')

  // If user has a scope defined and in the responsible arr request there is a single responsible that is not in hes/shes scope
  // then user is trying to access a visualization he/she isnt allowed
  if (!!userScope && responsibles?.some((r) => !userScope.includes(r)))
    throw new createHttpError.Unauthorized('Seu usuário não possui solicitação para esse escopo de visualização.')

  // If user has a scope defined and in the partner arr request there is a single partner that is not in hes/shes scope
  // then user is trying to access a visualization he/she isnt allowed
  if (!!partnerScope && partners?.some((r) => !partnerScope.includes(r)))
    throw new createHttpError.Unauthorized('Seu usuário não possui solicitação para esse escopo de visualização.')

  const responsiblesQuery: Filter<TOpportunity> = responsibles ? { 'responsaveis.id': { $in: responsibles } } : {}
  const partnerQuery = partners ? { idParceiro: { $in: [...partners, null] } } : {}
  const projectTypesQuery: Filter<TOpportunity> = projectTypes ? { 'tipo.id': { $in: [...projectTypes] } } : {}

  const afterDate = dayjs(after).startOf('day').subtract(3, 'hour').toDate()
  const beforeDate = dayjs(before).endOf('day').subtract(3, 'hour').toDate()

  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const opportunitiesCollection: Collection<TOpportunity> = db.collection('opportunities')

  const projects = await getOpportunities({ opportunitiesCollection, responsiblesQuery, partnerQuery, projectTypesQuery, afterDate, beforeDate })

  const condensedResults = projects.reduce(
    (acc: TOverallResults, current) => {
      const clientAquisitionOrigin = current.canalAquisicao
      if (!acc.porCanalAquisicao[clientAquisitionOrigin]) acc.porCanalAquisicao[clientAquisitionOrigin] = { adquiridos: 0, ganhos: 0 }

      // Insertion related checkings
      const insertDate = new Date(current.dataInsercao)
      const wasInsertedWithinCurrentPeriod = insertDate >= afterDate && insertDate <= beforeDate

      // Signing related checkings
      const signatureDate = current.ganho?.data ? new Date(current.ganho?.data) : null
      const hasContractSigned = !!signatureDate
      const wasSignedWithinCurrentPeriod = hasContractSigned && signatureDate >= afterDate && signatureDate <= beforeDate

      const proposeValue = current.valorProposta

      // Lost related checkings
      const lostDate = !!current.dataPerda ? new Date(current.dataPerda) : null
      const isLostProject = !!lostDate
      const lossReason = current.motivoPerda || 'NÃO DEFINIDO'
      const wasLostWithinCurrentPeriod = isLostProject && lostDate >= afterDate && lostDate <= beforeDate

      // Sale channel related information
      const isInbound = !!current.idMarketing

      const isTransfer = current.responsaveis.length > 1
      const isFromInsider = !!current.responsaveis.find((r) => r.papel == 'SDR')
      const isLead = isTransfer && isFromInsider
      const isSDROwn = !isTransfer && isFromInsider

      const isOutboundSDR = !isInbound && (isLead || isSDROwn)
      const isOutboundSeller = !isInbound && !isOutboundSDR

      // Increasing ATUAL qtys based on checkings
      if (wasInsertedWithinCurrentPeriod) {
        acc.projetosCriados.total += 1
        if (isInbound) acc.projetosCriados.inbound += 1
        if (isOutboundSDR) acc.projetosCriados.outboundSdr += 1
        if (isOutboundSeller) acc.projetosCriados.outboundVendedor += 1
        acc.porCanalAquisicao[clientAquisitionOrigin].adquiridos += 1
      }
      if (wasSignedWithinCurrentPeriod) {
        acc.projetosGanhos.total += 1
        if (isInbound) acc.projetosGanhos.inbound += 1
        if (isOutboundSDR) acc.projetosGanhos.outboundSdr += 1
        if (isOutboundSeller) acc.projetosGanhos.outboundVendedor += 1
        acc.porCanalAquisicao[clientAquisitionOrigin].ganhos += 1
      }
      if (wasLostWithinCurrentPeriod) {
        acc.projetosPerdidos.total += 1
        if (isInbound) acc.projetosPerdidos.inbound += 1
        if (isOutboundSDR) acc.projetosPerdidos.outboundSdr += 1
        if (isOutboundSeller) acc.projetosPerdidos.outboundVendedor += 1

        if (!acc.perdasPorMotivo[lossReason]) acc.perdasPorMotivo[lossReason] = 0
        acc.perdasPorMotivo[lossReason] += 1
      }
      if (wasSignedWithinCurrentPeriod) {
        acc.totalVendido.total += proposeValue
        if (isInbound) acc.totalVendido.inbound += proposeValue
        if (isOutboundSDR) acc.totalVendido.outboundSdr += proposeValue
        if (isOutboundSeller) acc.totalVendido.outboundVendedor += proposeValue
      }

      return acc
    },
    {
      projetosCriados: {
        inbound: 0,
        outboundVendedor: 0,
        outboundSdr: 0,
        total: 0,
      },
      projetosGanhos: {
        inbound: 0,
        outboundVendedor: 0,
        outboundSdr: 0,
        total: 0,
      },
      projetosPerdidos: {
        inbound: 0,
        outboundVendedor: 0,
        outboundSdr: 0,
        total: 0,
      },
      totalVendido: {
        inbound: 0,
        outboundVendedor: 0,
        outboundSdr: 0,
        total: 0,
      },
      perdasPorMotivo: {},
      porCanalAquisicao: {},
    }
  )
  return res.status(200).json({ data: condensedResults })
}

export default apiHandler({ POST: getOverallResults })
type TPromoter = WithId<Pick<TUser, 'nome' | 'avatar_url' | 'idGrupo'>>

type GetProjectsParams = {
  opportunitiesCollection: Collection<TOpportunity>
  responsiblesQuery: { 'responsaveis.id': { $in: string[] } } | {}
  partnerQuery: { idParceiro: { $in: string[] } } | {}
  projectTypesQuery: { 'tipo.id': { $in: string[] } } | {}
  afterDate: Date
  beforeDate: Date
}
type TOverallResultsProject = {
  idMarketing: TOpportunity['idMarketing']
  responsaveis: TOpportunity['responsaveis']
  ganho: TOpportunity['ganho']
  valorProposta: TProposal['valor']
  canalAquisicao: TClient['canalAquisicao']
  motivoPerda: TOpportunity['perda']['descricaoMotivo']
  dataPerda: TOpportunity['perda']['data']
  dataInsercao: TOpportunity['dataInsercao']
}
async function getOpportunities({ opportunitiesCollection, partnerQuery, responsiblesQuery, projectTypesQuery, afterDate, beforeDate }: GetProjectsParams) {
  try {
    const afterDateStr = afterDate.toISOString()
    const beforeDateStr = beforeDate.toISOString()
    const match = {
      ...partnerQuery,
      ...responsiblesQuery,
      ...projectTypesQuery,
      $or: [
        { $and: [{ dataInsercao: { $gte: afterDateStr } }, { dataInsercao: { $lte: beforeDateStr } }] },
        { $and: [{ 'perda.data': { $gte: afterDateStr } }, { 'perda.data': { $lte: beforeDateStr } }] },
        { $and: [{ 'ganho.data': { $gte: afterDateStr } }, { 'ganho.data': { $lte: beforeDateStr } }] },
      ],
      dataExclusao: null,
    }
    const addFields = { wonProposeObjectId: { $toObjectId: '$ganho.idProposta' }, clientObjectId: { $toObjectId: '$idCliente' } }
    const proposalLookup = { from: 'proposals', localField: 'wonProposeObjectId', foreignField: '_id', as: 'proposta' }
    const clientLookup = { from: 'clients', localField: 'clientObjectId', foreignField: '_id', as: 'cliente' }

    const projection = {
      idMarketing: 1,
      responsaveis: 1,
      ganho: 1,
      'proposta.valor': 1,
      'cliente.canalAquisicao': 1,
      perda: 1,
      dataInsercao: 1,
    }
    const result = await opportunitiesCollection
      .aggregate([{ $match: match }, { $addFields: addFields }, { $lookup: proposalLookup }, { $lookup: clientLookup }, { $project: projection }])
      .toArray()
    const projects = result.map((r) => ({
      idMarketing: r.idMarketing,
      responsaveis: r.responsaveis,
      ganho: r.ganho,
      valorProposta: r.proposta[0] ? r.proposta[0].valor : 0,
      canalAquisicao: r.cliente[0] ? r.cliente[0].canalAquisicao : 'NÃO DEFINIDO',
      dataPerda: r.perda.data,
      motivoPerda: r.perda.descricaoMotivo,
      dataInsercao: r.dataInsercao,
    })) as TOverallResultsProject[]
    return projects
  } catch (error) {
    throw error
  }
}
