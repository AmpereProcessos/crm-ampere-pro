import connectToDatabase from '@/services/mongodb/crm-db-connection'
import { apiHandler, validateAuthorization } from '@/utils/api'
import { ISaleGoal } from '@/utils/models'
import { TClient } from '@/utils/schemas/client.schema'
import { TOpportunity } from '@/utils/schemas/opportunity.schema'
import { TProposal } from '@/utils/schemas/proposal.schema'
import { TSaleGoal } from '@/utils/schemas/sale-goal.schema'
import { GeneralStatsFiltersSchema, ResponsiblesBodySchema } from '@/utils/schemas/stats.schema'

import { TUser } from '@/utils/schemas/user.schema'
import dayjs from 'dayjs'
import createHttpError from 'http-errors'
import { Collection, Filter, WithId } from 'mongodb'
import { NextApiHandler } from 'next'
import { z } from 'zod'

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

export type TSDRTeamResults = {
  [key: string]: {
    potenciaPico: {
      objetivo: number
      atingido: number
      origem: {
        INBOUND: number
        OUTBOUND: number
      }
    }
    valorVendido: {
      objetivo: number
      atingido: number
      origem: {
        INBOUND: number
        OUTBOUND: number
      }
    }
    projetosVendidos: {
      objetivo: number
      atingido: number
      origem: {
        INBOUND: number
        OUTBOUND: number
      }
    }
    projetosCriados: {
      objetivo: number
      atingido: number
      origem: {
        INBOUND: number
        OUTBOUND: number
      }
    }
    projetosEnviados: {
      objetivo: number
      atingido: number
      origem: {
        INBOUND: number
        OUTBOUND: number
      }
    }

    'POR VENDEDOR': {
      [key: string]: number
    }
  }
}
type GetResponse = {
  data: TSDRTeamResults
}
const getSDRTeamResults: NextApiHandler<GetResponse> = async (req, res) => {
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

  const userSaleGoalQuery: Filter<TSaleGoal> = responsibles ? { 'usuario.id': { $in: responsibles } } : {}

  const afterDate = dayjs(after).startOf('day').subtract(3, 'hour').toDate()
  const beforeDate = dayjs(before).endOf('day').subtract(3, 'hour').toDate()
  const currentPeriod = dayjs(beforeDate).format('MM/YYYY')

  const afterWithMarginDate = dayjs(afterDate).subtract(1, 'month').toDate()
  const beforeWithMarginDate = dayjs(beforeDate).subtract(1, 'month').toDate()

  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const opportunitiesCollection: Collection<TOpportunity> = db.collection('opportunities')
  const saleGoalsCollection: Collection<TSaleGoal> = db.collection('sale-goals')

  const saleGoals = await getSaleGoals({ saleGoalsCollection, currentPeriod, userSaleGoalQuery, partnerQuery })
  const projects = await getOpportunities({ opportunitiesCollection, afterDate, beforeDate, responsiblesQuery, partnerQuery, projectTypesQuery })

  const sdrResults = projects.reduce((acc: TSDRTeamResults, current) => {
    // Insertion related checkings
    const currentPeriod = dayjs(beforeDate).format('MM/YYYY')
    const insertDate = new Date(current.dataInsercao)
    const wasInsertedWithinCurrentPeriod = insertDate >= afterDate && insertDate <= beforeDate

    // if (!wasInsertedWithinCurrentPeriod) return acc

    // Signing related checkings
    const signatureDate = current.ganho?.data ? new Date(current.ganho.data) : null
    const hasContractSigned = !!signatureDate
    const wasSignedWithinCurrentPeriod = hasContractSigned && signatureDate >= afterDate && signatureDate <= beforeDate
    const wasSignedWithinPreviousPeriod = hasContractSigned && signatureDate >= afterWithMarginDate && signatureDate < beforeWithMarginDate
    const proposeValue = current.valorProposta
    const proposePeakPower = current.potenciaPicoProposta || 0

    const sdr = current.responsaveis.find((r) => r.papel == 'SDR')
    if (!sdr) return acc

    const seller = current.responsaveis.find((r) => r.papel == 'VENDEDOR')

    const sdrSaleGoals = saleGoals.find((goals) => goals.usuario?.id == sdr.nome && goals.periodo == currentPeriod)

    // If there is a sdr and seller, than is a trasfered project
    const isTransfer = !!sdr && !!seller
    const insider = !!sdr

    if (!insider) return acc

    const transferDate = seller?.dataInsercao ? new Date(seller.dataInsercao) : null
    const wasTransferedWithinCurrentPeriod = transferDate && transferDate >= afterDate && transferDate < beforeDate

    const isInbound = !!current.idMarketing
    if (!acc[sdr.nome]) {
      acc[sdr.nome] = {
        potenciaPico: {
          objetivo: 0,
          atingido: 0,
          origem: {
            INBOUND: 0,
            OUTBOUND: 0,
          },
        },
        valorVendido: {
          objetivo: 0,
          atingido: 0,
          origem: {
            INBOUND: 0,
            OUTBOUND: 0,
          },
        },
        projetosVendidos: {
          objetivo: 0,
          atingido: 0,
          origem: {
            INBOUND: 0,
            OUTBOUND: 0,
          },
        },
        projetosCriados: {
          objetivo: 0,
          atingido: 0,
          origem: {
            INBOUND: 0,
            OUTBOUND: 0,
          },
        },
        projetosEnviados: {
          objetivo: 0,
          atingido: 0,
          origem: {
            INBOUND: 0,
            OUTBOUND: 0,
          },
        },

        'POR VENDEDOR': {
          ['NÃO DEFINIDO']: 0,
        },
      }
    }
    // Creating info for the current responsible, if non-existent
    if (isTransfer && !acc[sdr.nome]['POR VENDEDOR'][seller.nome]) acc[sdr.nome]['POR VENDEDOR'][seller.nome] = 0

    // Defining goal information, if existent
    if (sdrSaleGoals) {
      acc[sdr.nome].potenciaPico.objetivo = sdrSaleGoals.metas.potenciaVendida || 0
      acc[sdr.nome].valorVendido.objetivo = sdrSaleGoals.metas.valorVendido || 0
      acc[sdr.nome].projetosVendidos.objetivo = sdrSaleGoals.metas.projetosVendidos || 0
      acc[sdr.nome].projetosCriados.objetivo = sdrSaleGoals.metas.projetosCriados || 0
      acc[sdr.nome].projetosEnviados.objetivo = sdrSaleGoals.metas.projetosEnviados || 0
    }
    if (wasInsertedWithinCurrentPeriod) {
      acc[sdr.nome].projetosCriados.atingido += 1

      if (isInbound) acc[sdr.nome].projetosCriados.origem['INBOUND'] += 1
      if (!isInbound) acc[sdr.nome].projetosCriados.origem['OUTBOUND'] += 1
    }
    if (wasTransferedWithinCurrentPeriod) {
      if (isTransfer) acc[sdr.nome].projetosEnviados.atingido += 1
      if (isTransfer) acc[sdr.nome]['POR VENDEDOR'][seller.nome] += 1
      if (isTransfer && isInbound) acc[sdr.nome].projetosEnviados.origem['INBOUND'] += 1
      if (isTransfer && !isInbound) acc[sdr.nome].projetosEnviados.origem['OUTBOUND'] += 1
    }
    if (wasSignedWithinCurrentPeriod) {
      acc[sdr.nome].potenciaPico.atingido += proposePeakPower
      acc[sdr.nome].valorVendido.atingido += proposeValue
      acc[sdr.nome].projetosVendidos.atingido += 1

      if (isInbound) acc[sdr.nome].potenciaPico.origem['INBOUND'] += proposePeakPower
      if (!isInbound) acc[sdr.nome].potenciaPico.origem['OUTBOUND'] += proposePeakPower
      if (isInbound) acc[sdr.nome].valorVendido.origem['INBOUND'] += proposeValue
      if (!isInbound) acc[sdr.nome].valorVendido.origem['OUTBOUND'] += proposeValue
      if (isInbound) acc[sdr.nome].projetosVendidos.origem['INBOUND'] += 1
      if (!isInbound) acc[sdr.nome].projetosVendidos.origem['OUTBOUND'] += 1
    }

    return acc
  }, {})
  return res.status(200).json({ data: sdrResults })
}

export default apiHandler({ POST: getSDRTeamResults })

async function getSaleGoals({
  saleGoalsCollection,
  currentPeriod,
  userSaleGoalQuery,
  partnerQuery,
}: {
  saleGoalsCollection: Collection<TSaleGoal>
  currentPeriod: string
  userSaleGoalQuery: Filter<TSaleGoal>
  partnerQuery: { idParceiro: { $in: string[] } } | {}
}) {
  try {
    const saleGoals = await saleGoalsCollection.find({ periodo: currentPeriod, ...partnerQuery, ...userSaleGoalQuery }).toArray()
    return saleGoals
  } catch (error) {
    throw error
  }
}
type GetProjectsParams = {
  opportunitiesCollection: Collection<TOpportunity>
  responsiblesQuery: { 'responsaveis.id': { $in: string[] } } | {}
  partnerQuery: { idParceiro: { $in: string[] } } | {}
  projectTypesQuery: { 'tipo.id': { $in: string[] } } | {}
  afterDate: Date
  beforeDate: Date
}
type TSDRResultsProject = {
  idMarketing: TOpportunity['idMarketing']
  responsaveis: TOpportunity['responsaveis']
  ganho: TOpportunity['ganho']
  valorProposta: TProposal['valor']
  potenciaPicoProposta: TProposal['potenciaPico']
  canalAquisicao: TClient['canalAquisicao']
  dataInsercao: string
}
async function getOpportunities({ opportunitiesCollection, responsiblesQuery, partnerQuery, projectTypesQuery, afterDate, beforeDate }: GetProjectsParams) {
  try {
    const afterDateStr = afterDate.toISOString()
    const beforeDateStr = beforeDate.toISOString()
    const match = {
      ...partnerQuery,
      ...responsiblesQuery,
      $or: [
        { $and: [{ 'responsaveis.dataInsercao': { $gte: afterDateStr } }, { 'responsaveis.dataInsercao': { $lte: beforeDateStr } }] },
        { $and: [{ dataInsercao: { $gte: afterDateStr } }, { dataInsercao: { $lte: beforeDateStr } }] },
        { $and: [{ 'ganho.data': { $gte: afterDateStr } }, { 'ganho.data': { $lte: beforeDateStr } }] },
      ],
      dataExclusao: null,
    }
    const addFields = {
      activeProposeObjectID: {
        $toObjectId: '$ganho.idProposta',
      },
      clientObjectId: { $toObjectId: '$idCliente' },
    }
    const proposeLookup = { from: 'proposals', localField: 'activeProposeObjectID', foreignField: '_id', as: 'proposta' }
    const clientLookup = { from: 'clients', localField: 'clientObjectId', foreignField: '_id', as: 'cliente' }
    const projection = {
      idMarketing: 1,
      responsaveis: 1,
      ganho: 1,
      'proposta.valor': 1,
      'proposta.potenciaPico': 1,
      'cliente.canalAquisicao': 1,
      dataInsercao: 1,
    }
    const result = await opportunitiesCollection
      .aggregate([{ $match: match }, { $addFields: addFields }, { $lookup: proposeLookup }, { $lookup: clientLookup }, { $project: projection }])
      .toArray()
    const projects = result.map((r) => ({
      idMarketing: r.idMarketing,
      responsaveis: r.responsaveis,
      ganho: r.ganho,
      valorProposta: r.proposta[0] ? r.proposta[0].valor : 0,
      potenciaPicoProposta: r.proposta[0] ? r.proposta[0].potenciaPico : 0,
      canalAquisicao: r.cliente[0] ? r.cliente[0].canalAquisicao : 'NÃO DEFINIDO',
      dataInsercao: r.dataInsercao,
    })) as TSDRResultsProject[]
    return projects
  } catch (error) {
    throw error
  }
}
