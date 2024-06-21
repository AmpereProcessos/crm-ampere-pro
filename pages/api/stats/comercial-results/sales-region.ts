import connectToDatabase from '@/services/mongodb/crm-db-connection'
import { apiHandler, validateAuthorization } from '@/utils/api'
import { TOpportunity } from '@/utils/schemas/opportunity.schema'
import { TProposal } from '@/utils/schemas/proposal.schema'
import { GeneralStatsFiltersSchema } from '@/utils/schemas/stats.schema'
import dayjs from 'dayjs'
import createHttpError from 'http-errors'
import { Collection, Filter } from 'mongodb'
import { NextApiHandler } from 'next'
import { z } from 'zod'

type TResultsByRegionReduced = {
  [key: string]: {
    'OPORTUNIDADES CRIADAS': {
      INBOUND: number
      OUTBOUND: number
    }
    'OPORTUNIDADES GANHAS': {
      INBOUND: number
      OUTBOUND: number
    }
    'OPORTUNIDADES PERDIDAS': {
      INBOUND: number
      OUTBOUND: number
    }
    'VALOR VENDIDO': {
      INBOUND: number
      OUTBOUND: number
    }
  }
}
export type TResultsByRegion = {
  CIDADE: string
  'OPORTUNIDADES CRIADAS': {
    INBOUND: number
    OUTBOUND: number
  }
  'OPORTUNIDADES GANHAS': {
    INBOUND: number
    OUTBOUND: number
  }
  'OPORTUNIDADES PERDIDAS': {
    INBOUND: number
    OUTBOUND: number
  }
  'VALOR VENDIDO': {
    INBOUND: number
    OUTBOUND: number
  }
}

type GetResponse = {
  data: TResultsByRegion[]
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
const getResultsByRegion: NextApiHandler<GetResponse> = async (req, res) => {
  const session = await validateAuthorization(req, res, 'resultados', 'visualizarComercial', true)
  const partnerScope = session.user.permissoes.parceiros.escopo
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
  const partnerQuery: Filter<TOpportunity> = partners ? { idParceiro: { $in: [...partners] } } : {}
  const projectTypesQuery: Filter<TOpportunity> = projectTypes ? { 'tipo.id': { $in: [...projectTypes] } } : {}

  const afterDate = dayjs(after).startOf('day').subtract(3, 'hour').toDate()
  const beforeDate = dayjs(before).endOf('day').subtract(3, 'hour').toDate()

  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const collection: Collection<TOpportunity> = db.collection('opportunities')

  const query: Filter<TOpportunity> = { ...partnerQuery, ...responsiblesQuery, ...projectTypesQuery }
  const opportunities = await getOpportunities({ collection, query, afterDate, beforeDate })

  const resultsReduced = opportunities.reduce((acc: TResultsByRegionReduced, current) => {
    const city = current.cidade || 'NÃO DEFINIDO'
    if (!acc[city])
      acc[city] = {
        'OPORTUNIDADES CRIADAS': { INBOUND: 0, OUTBOUND: 0 },
        'OPORTUNIDADES GANHAS': { INBOUND: 0, OUTBOUND: 0 },
        'OPORTUNIDADES PERDIDAS': { INBOUND: 0, OUTBOUND: 0 },
        'VALOR VENDIDO': { INBOUND: 0, OUTBOUND: 0 },
      }

    // Insertion related data
    const insertionDate = new Date(current.dataInsercao)
    const wasInsertedWithinCurrentPeriod = insertionDate >= afterDate && insertionDate <= beforeDate
    // Win related data
    const wonDate = current.ganho.data ? new Date(current.ganho.data) : null
    const wasWonWithinCurrentPeriod = wonDate && wonDate >= afterDate && wonDate <= beforeDate
    const winValue = current.valorProposta || 0

    // Loss related data
    const lostDate = current.dataPerda ? new Date(current.dataPerda) : null
    const wasLostWithinCurrentPeriod = !!lostDate && lostDate >= afterDate && lostDate <= beforeDate
    // Sale channel related information
    const isInbound = !!current.idMarketing

    if (wasInsertedWithinCurrentPeriod) {
      if (isInbound) acc[city]['OPORTUNIDADES CRIADAS'].INBOUND += 1
      else acc[city]['OPORTUNIDADES CRIADAS'].OUTBOUND += 1
    }
    if (wasWonWithinCurrentPeriod) {
      if (isInbound) {
        acc[city]['OPORTUNIDADES GANHAS'].INBOUND += 1
        acc[city]['VALOR VENDIDO'].INBOUND += winValue
      } else {
        acc[city]['OPORTUNIDADES GANHAS'].OUTBOUND += 1
        acc[city]['VALOR VENDIDO'].OUTBOUND += winValue
      }
    }
    if (wasLostWithinCurrentPeriod) {
      if (isInbound) acc[city]['OPORTUNIDADES PERDIDAS'].INBOUND += 1
      else acc[city]['OPORTUNIDADES PERDIDAS'].OUTBOUND += 1
    }
    return acc
  }, {})
  const results: TResultsByRegion[] = Object.entries(resultsReduced)
    .map(([city, stats]) => ({ CIDADE: city, ...stats }))
    .sort((a, b) => a.CIDADE.localeCompare(b.CIDADE))
  return res.status(200).json({ data: results })
}

export default apiHandler({ POST: getResultsByRegion })
type GetOpportunitiesParams = {
  collection: Collection<TOpportunity>
  query: Filter<TOpportunity>
  afterDate: Date
  beforeDate: Date
}

type TResultsByRegionOpportunity = {
  idMarketing: TOpportunity['idMarketing']
  cidade: TOpportunity['localizacao']['cidade']
  valorProposta: TProposal['valor']
  ganho: TOpportunity['ganho']
  dataPerda: TOpportunity['perda']['data']
  dataInsercao: TOpportunity['dataInsercao']
}
async function getOpportunities({ collection, query, afterDate, beforeDate }: GetOpportunitiesParams) {
  const afterDateStr = afterDate.toISOString()
  const beforeDateStr = beforeDate.toISOString()
  const match = {
    ...query,
    $or: [
      { $and: [{ dataInsercao: { $gte: afterDateStr } }, { dataInsercao: { $lte: beforeDateStr } }] },
      { $and: [{ 'perda.data': { $gte: afterDateStr } }, { 'perda.data': { $lte: beforeDateStr } }] },
      { $and: [{ 'ganho.data': { $gte: afterDateStr } }, { 'ganho.data': { $lte: beforeDateStr } }] },
    ],
  }
  const addFields = { wonProposeObjectId: { $toObjectId: '$ganho.idProposta' } }
  const lookup = { from: 'proposals', localField: 'wonProposeObjectId', foreignField: '_id', as: 'proposta' }
  const projection = {
    idMarketing: 1,
    'localizacao.cidade': 1,
    ganho: 1,
    'proposta.valor': 1,
    perda: 1,
    dataInsercao: 1,
  }
  const opportunities = await collection.aggregate([{ $match: match }, { $addFields: addFields }, { $lookup: lookup }, { $project: projection }]).toArray()
  const result: TResultsByRegionOpportunity[] = opportunities.map((opportunity) => {
    return {
      idMarketing: opportunity.idMarketing,
      ganho: opportunity.ganho,
      valorProposta: opportunity.proposta[0] ? opportunity.proposta[0].valor : 0,
      dataPerda: opportunity.perda.data,
      dataInsercao: opportunity.dataInsercao,
      cidade: opportunity.localizacao.cidade,
    }
  })
  return result
}
