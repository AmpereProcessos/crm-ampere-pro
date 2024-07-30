import { formatDateQuery } from '@/lib/methods/formatting'
import { getPartnersSimplified } from '@/repositories/partner-simplified/query'
import { getProjectTypesSimplified } from '@/repositories/project-type/queries'
import { getOpportunityCreators } from '@/repositories/users/queries'
import connectToDatabase from '@/services/mongodb/crm-db-connection'
import { apiHandler, validateAuthenticationWithSession, validateAuthorization } from '@/utils/api'
import { TActivity } from '@/utils/schemas/activities.schema'
import { TOpportunity } from '@/utils/schemas/opportunity.schema'
import { TPartner, TPartnerSimplifiedDTO } from '@/utils/schemas/partner.schema'
import { TProjectType, TProjectTypeDTOSimplified } from '@/utils/schemas/project-types.schema'
import { TProposal } from '@/utils/schemas/proposal.schema'
import { GeneralStatsFiltersSchema, QueryDatesSchema, TGeneralStats } from '@/utils/schemas/stats.schema'
import { TUser, TUserDTOSimplified } from '@/utils/schemas/user.schema'
import dayjs from 'dayjs'
import createHttpError from 'http-errors'
import { Collection, Filter, ObjectId } from 'mongodb'
import { NextApiHandler } from 'next'

export type TGeneralStatsQueryFiltersOptions = {
  responsibles: TUserDTOSimplified[]
  partners: TPartnerSimplifiedDTO[]
  projectTypes: TProjectTypeDTOSimplified[]
}

type GetResponse = {
  data: TGeneralStatsQueryFiltersOptions
}

const getQueryFiltersOptions: NextApiHandler<GetResponse> = async (req, res) => {
  const session = await validateAuthenticationWithSession(req, res)
  const parterScope = session.user.permissoes.parceiros.escopo
  const partnerQuery = parterScope ? { idParceiro: { $in: [...parterScope, null] } } : {}

  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const usersCollection: Collection<TUser> = db.collection('users')
  const partnersCollection: Collection<TPartner> = db.collection('partners')
  const projectTypesCollection: Collection<TProjectType> = db.collection('project-types')

  const responsibles = await getOpportunityCreators({ collection: usersCollection, query: partnerQuery as Filter<TUser> })
  const partners = await getPartnersSimplified({ collection: partnersCollection, query: partnerQuery as Filter<TPartner> })
  const projectTypes = await getProjectTypesSimplified({ collection: projectTypesCollection, query: partnerQuery })

  const options = {
    responsibles: responsibles.map((u) => ({ ...u, _id: u._id.toString() })),
    partners: partners.map((u) => ({ ...u, _id: u._id.toString() })),
    projectTypes: projectTypes.map((u) => ({ ...u, _id: u._id.toString() })),
  }
  return res.status(200).json({ data: options })
}

type PostResponse = { data: TGeneralStats }
const getStats: NextApiHandler<PostResponse> = async (req, res) => {
  const session = await validateAuthorization(req, res, 'oportunidades', 'visualizar', true)
  const partnerScope = session.user.permissoes.parceiros.escopo
  const opportunityVisibilityScope = session.user.permissoes.oportunidades.escopo

  const { after, before } = QueryDatesSchema.parse(req.query)
  const { responsibles, partners, projectTypes } = GeneralStatsFiltersSchema.parse(req.body)
  if (typeof after != 'string' || typeof before != 'string') throw new createHttpError.BadRequest('Parâmetros de período inválidos.')

  // If user has a scope defined and in the request there isnt a responsible arr defined, then user is trying
  // to access a overall visualiation, which he/she isnt allowed
  if (!!opportunityVisibilityScope && !responsibles)
    throw new createHttpError.Unauthorized('Seu usuário não possui solicitação para esse escopo de visualização.')

  // If user has a scope defined and in the request there isnt a partners arr defined, then user is trying
  // to access a overall visualiation, which he/she isnt allowed
  if (!!partnerScope && !partners) throw new createHttpError.Unauthorized('Seu usuário não possui solicitação para esse escopo de visualização.')

  // If user has a scope defined and in the responsible arr request there is a single responsible that is not in hes/shes scope
  // then user is trying to access a visualization he/she isnt allowed
  if (!!opportunityVisibilityScope && responsibles?.some((r) => !opportunityVisibilityScope.includes(r)))
    throw new createHttpError.Unauthorized('Seu usuário não possui solicitação para esse escopo de visualização.')

  // If user has a scope defined and in the partner arr request there is a single partner that is not in hes/shes scope
  // then user is trying to access a visualization he/she isnt allowed
  if (!!partnerScope && partners?.some((r) => !partnerScope.includes(r)))
    throw new createHttpError.Unauthorized('Seu usuário não possui solicitação para esse escopo de visualização.')

  const responsiblesQuery: Filter<TOpportunity> = responsibles ? { 'responsaveis.id': { $in: responsibles } } : {}
  const partnerQuery: Filter<TOpportunity> = partners ? { idParceiro: { $in: [...partners] } } : {}
  const projectTypeQuery: Filter<TOpportunity> = projectTypes ? { 'tipo.id': { $in: [...projectTypes] } } : {}

  const query: Filter<TOpportunity> = { ...responsiblesQuery, ...partnerQuery, ...projectTypeQuery }

  const afterDate = formatDateQuery(after, 'start', 'date') as Date
  const beforeDate = formatDateQuery(before, 'end', 'date') as Date
  const afterWithMarginDate = new Date(dayjs(after).subtract(1, 'month').toISOString())
  const beforeWithMarginDate = new Date(dayjs(before).subtract(1, 'month').set('hour', 22).toISOString())

  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const opportunitiesCollection: Collection<TOpportunity> = db.collection('opportunities')
  const activitiesCollection: Collection<TActivity> = db.collection('activities')

  const condensedInfo = await getSimplifiedInfo({ opportunitiesCollection, query, afterDate, beforeDate, afterWithMarginDate, beforeWithMarginDate })
  const wonOpportunities = await getWonOpportunities({ opportunitiesCollection, query, afterDate, beforeDate })
  const pendingWins = await getPendingWins({ opportunitiesCollection, query })
  const activities = await getActivities({ collection: activitiesCollection, query: { ...responsiblesQuery, ...partnerQuery } as Filter<TActivity> })

  res.status(200).json({
    data: {
      simplificado: condensedInfo,
      ganhos: wonOpportunities,
      ganhosPendentes: pendingWins,
      atividades: activities,
    },
  })
}

export default apiHandler({
  GET: getQueryFiltersOptions,
  POST: getStats,
})
// SIMPLIFIED
type TOpportunitySimplifiedResult = {
  idMarketing: TOpportunity['idMarketing']
  responsaveis: TOpportunity['responsaveis']
  ganho: TOpportunity['ganho']
  perda: TOpportunity['perda']
  proposta: { valor: number; potenciaPico: number }[]
  dataInsercao: TOpportunity['dataInsercao']
}
type GetSimplifiedInfoParams = {
  opportunitiesCollection: Collection<TOpportunity>
  query: Filter<TOpportunity>
  afterDate: Date
  afterWithMarginDate: Date
  beforeDate: Date
  beforeWithMarginDate: Date
}
async function getSimplifiedInfo({
  opportunitiesCollection,
  query,
  afterDate,
  afterWithMarginDate,
  beforeDate,
  beforeWithMarginDate,
}: GetSimplifiedInfoParams) {
  try {
    const afterDateStr = afterDate.toISOString()
    const afterWithMarginDateStr = afterWithMarginDate.toISOString()
    const beforeDateStr = beforeDate.toISOString()
    const match: Filter<TOpportunity> = {
      ...query,
      $or: [
        { $and: [{ dataInsercao: { $gte: afterWithMarginDateStr } }, { dataInsercao: { $lte: beforeDateStr } }] },
        { $and: [{ 'perda.data': { $gte: afterWithMarginDateStr } }, { 'perda.data': { $lte: beforeDateStr } }] },
        { $and: [{ 'ganho.data': { $gte: afterWithMarginDateStr } }, { 'ganho.data': { $lte: beforeDateStr } }] },
      ],
    }
    const addFields = { wonProposeObjectId: { $toObjectId: '$ganho.idProposta' } }
    const lookup = { from: 'proposals', localField: 'wonProposeObjectId', foreignField: '_id', as: 'proposta' }
    const projection = {
      nome: 1,
      idMarketing: 1,
      responsaveis: 1,
      ganho: 1,
      perda: 1,
      'proposta.valor': 1,
      'proposta.potenciaPico': 1,
      dataInsercao: 1,
    }
    const result = (await opportunitiesCollection
      .aggregate([{ $match: match }, { $addFields: addFields }, { $lookup: lookup }, { $project: projection }])
      .toArray()) as TOpportunitySimplifiedResult[]
    const opportunities = result.map((r) => ({
      idMarketing: r.idMarketing,
      responsaveis: r.responsaveis,
      ganho: r.ganho,
      valorProposta: r.proposta[0] ? r.proposta[0].valor : 0,
      potenciaProposta: r.proposta[0] ? r.proposta[0].potenciaPico : 0,
      dataPerda: r.perda.data,
      motivoPerda: r.perda.descricaoMotivo,
      dataInsercao: r.dataInsercao,
    }))

    const condensedInfo = opportunities.reduce(
      (acc, current) => {
        // Insertion related checkings
        const insertDate = new Date(current.dataInsercao)
        const wasInsertedWithinCurrentPeriod = insertDate >= afterDate && insertDate <= beforeDate
        const wasInsertedWithinPreviousPeriod = insertDate >= afterWithMarginDate && insertDate < beforeWithMarginDate

        // Signing related checkings
        const signatureDate = current.ganho?.data ? new Date(current.ganho?.data) : null
        const hasContractSigned = !!signatureDate
        const wasSignedWithinCurrentPeriod = hasContractSigned && signatureDate >= afterDate && signatureDate <= beforeDate
        const wasSignedWithinPreviousPeriod = hasContractSigned && signatureDate >= afterWithMarginDate && signatureDate <= beforeWithMarginDate

        const proposalValue = current.valorProposta
        const proposalPower = current.potenciaProposta
        // Lost related checkings
        const lostDate = !!current.dataPerda ? new Date(current.dataPerda) : null
        const isLostProject = !!lostDate
        const wasLostWithinCurrentPeriod = isLostProject && lostDate >= afterDate && lostDate <= beforeDate
        const wasLostWithinPreviousPeriod = isLostProject && lostDate >= afterWithMarginDate && lostDate <= beforeWithMarginDate

        // Increasing ATUAL qtys based on checkings
        if (wasInsertedWithinCurrentPeriod) acc['ATUAL'].projetosCriados += 1
        if (wasSignedWithinCurrentPeriod) acc['ATUAL'].projetosGanhos += 1
        if (wasLostWithinCurrentPeriod) acc['ATUAL'].projetosPerdidos += 1
        if (wasSignedWithinCurrentPeriod) acc['ATUAL'].totalVendido += proposalValue
        if (wasSignedWithinCurrentPeriod) acc['ATUAL'].potenciaVendida += proposalPower

        // Increasing ANTERIOR qtys based on checkings
        if (wasInsertedWithinPreviousPeriod) acc['ANTERIOR'].projetosCriados += 1
        if (wasSignedWithinPreviousPeriod) acc['ANTERIOR'].projetosGanhos += 1
        if (wasLostWithinPreviousPeriod) acc['ANTERIOR'].projetosPerdidos += 1
        if (wasSignedWithinPreviousPeriod) acc['ANTERIOR'].totalVendido += proposalValue
        if (wasSignedWithinPreviousPeriod) acc['ANTERIOR'].potenciaVendida += proposalPower

        return acc
      },
      {
        ANTERIOR: {
          projetosCriados: 0,
          projetosGanhos: 0,
          projetosPerdidos: 0,
          totalVendido: 0,
          potenciaVendida: 0,
        },
        ATUAL: {
          projetosCriados: 0,
          projetosGanhos: 0,
          projetosPerdidos: 0,
          totalVendido: 0,
          potenciaVendida: 0,
        },
      }
    )
    return condensedInfo
  } catch (error) {
    throw error
  }
}
// WON OPPORTUNITIES
type TSignedProposalResult = {
  _id: ObjectId
  nome: TOpportunity['nome']
  idMarketing: TOpportunity['idMarketing']
  responsaveis: TOpportunity['responsaveis']
  ganho: TOpportunity['ganho']
  proposta: { _id: string; nome: TProposal['nome']; valor: TProposal['valor']; potenciaPico: TProposal['potenciaPico'] }[]
  dataInsercao: TOpportunity['dataInsercao']
}
type GetWonOpportunitiesParams = {
  opportunitiesCollection: Collection<TOpportunity>
  query: Filter<TOpportunity>
  afterDate: Date
  beforeDate: Date
}
async function getWonOpportunities({ opportunitiesCollection, query, afterDate, beforeDate }: GetWonOpportunitiesParams) {
  const afterDateStr = afterDate.toISOString()
  const beforeDateStr = beforeDate.toISOString()
  const match: Filter<TOpportunity> = {
    ...query,
    $and: [{ 'ganho.data': { $gte: afterDateStr } }, { 'ganho.data': { $lte: beforeDateStr } }],
  }
  const addFields = { wonProposeObjectId: { $toObjectId: '$ganho.idProposta' } }
  const lookup = { from: 'proposals', localField: 'wonProposeObjectId', foreignField: '_id', as: 'proposta' }
  const projection = {
    nome: 1,
    idMarketing: 1,
    responsaveis: 1,
    ganho: 1,
    'proposta._id': 1,
    'proposta.nome': 1,
    'proposta.valor': 1,
    'proposta.potenciaPico': 1,
    dataInsercao: 1,
  }
  const result = (await opportunitiesCollection
    .aggregate([{ $match: match }, { $addFields: addFields }, { $lookup: lookup }, { $project: projection }])
    .toArray()) as TSignedProposalResult[]

  const signedProposals = result.map((r) => {
    const proposal = r.proposta[0]
      ? { _id: r.proposta[0]._id, nome: r.proposta[0].nome, valor: r.proposta[0].valor, potenciaPico: r.proposta[0].potenciaPico }
      : null
    return {
      _id: r._id.toString(),
      nome: r.nome,
      responsaveis: r.responsaveis,
      idMarketing: r.idMarketing,
      proposta: proposal,
      dataGanho: r.ganho.data as string,
      dataInsercao: r.dataInsercao,
    }
  })
  return signedProposals
}
// PENDING WINS
type TPendingWinResult = {
  _id: ObjectId
  nome: TOpportunity['nome']
  idMarketing: TOpportunity['idMarketing']
  responsaveis: TOpportunity['responsaveis']
  ganho: TOpportunity['ganho']
  proposta: { _id: string; nome: TProposal['nome']; valor: TProposal['valor']; potenciaPico: TProposal['potenciaPico'] }[]
  dataInsercao: TOpportunity['dataInsercao']
}
type GetPendingWinsParams = {
  opportunitiesCollection: Collection<TOpportunity>
  query: Filter<TOpportunity>
}
async function getPendingWins({ opportunitiesCollection, query }: GetPendingWinsParams) {
  const match: Filter<TOpportunity> = {
    ...query,
    'ganho.data': null,
    'perda.data': null,
    'ganho.dataSolicitacao': { $ne: null },
  }
  const addFields = { wonProposeObjectId: { $toObjectId: '$ganho.idProposta' } }
  const lookup = { from: 'proposals', localField: 'wonProposeObjectId', foreignField: '_id', as: 'proposta' }
  const projection = {
    nome: 1,
    idMarketing: 1,
    responsaveis: 1,
    ganho: 1,
    'proposta._id': 1,
    'proposta.nome': 1,
    'proposta.valor': 1,
    'proposta.potenciaPico': 1,
    dataInsercao: 1,
  }
  const result = (await opportunitiesCollection
    .aggregate([{ $match: match }, { $addFields: addFields }, { $lookup: lookup }, { $project: projection }])
    .toArray()) as TPendingWinResult[]
  const pendingWins = result.map((r) => {
    const proposal = r.proposta[0]
      ? { _id: r.proposta[0]._id, nome: r.proposta[0].nome, valor: r.proposta[0].valor, potenciaPico: r.proposta[0].potenciaPico }
      : null
    return {
      _id: r._id.toString(),
      nome: r.nome,
      idMarketing: r.idMarketing,
      responsaveis: r.responsaveis,
      proposta: proposal,
      dataSolicitacao: r.ganho.dataSolicitacao as string,
    }
  })
  return pendingWins
}
// ACTIVITIES

type GetActivitiesParams = {
  collection: Collection<TActivity>
  query: Filter<TActivity>
}
async function getActivities({ collection, query }: GetActivitiesParams) {
  try {
    const activities = await collection.find({ dataConclusao: null, ...query }, { sort: { dataVencimento: 1 } }).toArray()
    return activities.map((activity) => ({ ...activity, _id: activity._id.toString() }))
  } catch (error) {
    throw error
  }
}
