import { getSalePromoters } from '@/repositories/users/queries'
import connectToDatabase from '@/services/mongodb/crm-db-connection'
import { apiHandler, validateAuthorization } from '@/utils/api'
import { TClient } from '@/utils/schemas/client.schema'
import { TOpportunity } from '@/utils/schemas/opportunity.schema'
import { TProposal } from '@/utils/schemas/proposal.schema'
import { TSaleGoal } from '@/utils/schemas/sale-goal.schema'
import { QueryDatesSchema } from '@/utils/schemas/stats.schema'
import { TUser, TUserDTO } from '@/utils/schemas/user.schema'
import dayjs from 'dayjs'
import { Collection } from 'mongodb'
import { NextApiHandler } from 'next'

type TGoals = {
  projetosCriados: number
  potenciaVendida: number
  valorVendido: number
  projetosVendidos: number
  projetosEnviados: number
  conversao: number
}
export type TSalePromotersResultsReduced = {
  [key: string]: {
    id: TUserDTO['_id']
    nome: TUser['nome']
    avatar_url: TUser['avatar_url']
    potenciaVendida: {
      objetivo: number
      atingido: number
    }
    valorVendido: {
      objetivo: number
      atingido: number
    }
    projetosVendidos: {
      objetivo: number
      atingido: number
    }
    projetosCriados: {
      objetivo: number
      atingido: number
    }
    projetosEnviados: {
      objetivo: number
      atingido: number
    }
    conversao: {
      objetivo: number
      atingido: number
    }
  }
}
export type TSalePromotersResults = {
  id: TUserDTO['_id']
  nome: TUser['nome']
  avatar_url: TUser['avatar_url']
  potenciaVendida: {
    objetivo: number
    atingido: number
  }
  valorVendido: {
    objetivo: number
    atingido: number
  }
  projetosVendidos: {
    objetivo: number
    atingido: number
  }
  projetosCriados: {
    objetivo: number
    atingido: number
  }
  projetosEnviados: {
    objetivo: number
    atingido: number
  }
  conversao: {
    objetivo: number
    atingido: number
  }
}[]
const getSellersRoute: NextApiHandler<{ data: TSalePromotersResults }> = async (req, res) => {
  const session = await validateAuthorization(req, res, 'resultados', 'visualizarComercial', true)
  const partnerId = session.user.idParceiro
  const partnerScope = session.user.permissoes.parceiros.escopo

  const userId = session.user.id
  const userScope = session.user.permissoes.resultados.escopo

  const { after, before } = QueryDatesSchema.parse(req.query)

  const afterDate = dayjs(after).startOf('day').subtract(3, 'hour').toDate()
  const beforeDate = dayjs(before).endOf('day').subtract(3, 'hour').toDate()

  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const usersCollection = db.collection<TUser>('users')
  const saleGoalsCollection = db.collection<TSaleGoal>('sale-goals')
  const opportunitiesCollection = db.collection<TOpportunity>('opportunities')

  const salePromoters = await getSalePromoters({ collection: usersCollection, query: {} })
  const opportunities = await getOpportunities({ opportunitiesCollection, afterDate, beforeDate })

  const initialResultsReduced = salePromoters.reduce((acc: TSalePromotersResultsReduced, current) => {
    const promoterSaleGoals = current.metas.reduce(
      (acc: TGoals, goalCurrent) => {
        const afterDatetime = new Date(after).getTime()
        const beforeDatetime = new Date(before).getTime()

        const monthStartDatetime = new Date(goalCurrent.periodoInicio).getTime()
        const monthEndDatetime = new Date(goalCurrent.periodoFim).getTime()
        let multiplier = 0
        if (
          (afterDatetime < monthStartDatetime && beforeDatetime < monthStartDatetime) ||
          (afterDatetime > monthEndDatetime && beforeDatetime > monthEndDatetime)
        )
          multiplier = 0
        // Caso o período de filtro da query compreenda o mês inteiro
        if (afterDatetime <= monthStartDatetime && beforeDatetime >= monthEndDatetime) {
          multiplier = 1
        } else {
          if (beforeDatetime > monthEndDatetime) {
            const applicableDays = dayjs(goalCurrent.periodoFim).diff(dayjs(after), 'days')
            console.log('CAI NO CASO 2 - CASO 1', applicableDays, after, before, goalCurrent.periodoInicio, goalCurrent.periodoFim)
            multiplier = applicableDays / goalCurrent.periodoDias
          } else {
            const applicableDays = dayjs(before).diff(dayjs(goalCurrent.periodoInicio), 'days')
            console.log('CAI NO CASO 2 - CASO 2', applicableDays, after, before, goalCurrent.periodoInicio, goalCurrent.periodoFim)
            multiplier = applicableDays / goalCurrent.periodoDias
          }
          return acc
        }
        acc.projetosCriados += (goalCurrent.metas.projetosCriados || 0) * multiplier
        acc.potenciaVendida += (goalCurrent.metas.potenciaVendida || 0) * multiplier
        acc.valorVendido += (goalCurrent.metas.valorVendido || 0) * multiplier
        acc.projetosVendidos += (goalCurrent.metas.projetosVendidos || 0) * multiplier
        acc.projetosEnviados += (goalCurrent.metas.projetosEnviados || 0) * multiplier
        acc.conversao += (goalCurrent.metas.conversao || 0) * multiplier

        return acc
      },
      {
        projetosCriados: 0,
        potenciaVendida: 0,
        valorVendido: 0,
        projetosVendidos: 0,
        projetosEnviados: 0,
        conversao: 0,
      }
    )
    acc[current.nome] = {
      id: current._id.toString(),
      nome: current.nome,
      avatar_url: current.avatar_url,
      potenciaVendida: {
        atingido: 0,
        objetivo: promoterSaleGoals.potenciaVendida,
      },
      valorVendido: {
        atingido: 0,
        objetivo: promoterSaleGoals.valorVendido,
      },
      projetosVendidos: {
        atingido: 0,
        objetivo: promoterSaleGoals.projetosVendidos,
      },
      projetosCriados: {
        atingido: 0,
        objetivo: promoterSaleGoals.projetosCriados,
      },
      projetosEnviados: {
        atingido: 0,
        objetivo: promoterSaleGoals.projetosEnviados,
      },
      conversao: {
        atingido: 0,
        objetivo: promoterSaleGoals.conversao,
      },
    }
    return acc
  }, {})

  const results = opportunities.reduce((acc: TSalePromotersResultsReduced, current) => {
    const seller = current.responsaveis.find((r) => r.papel == 'VENDEDOR')
    const sdr = current.responsaveis.find((r) => r.papel == 'SDR')

    // If there is a sdr and seller, than is a trasfered project
    const isTransfer = !!sdr && !!seller
    const insider = !!sdr

    const transferDate = seller?.dataInsercao ? new Date(seller.dataInsercao) : null
    const wasTransferedWithinCurrentPeriod = transferDate && transferDate >= afterDate && transferDate < beforeDate

    // Insertion related checkings
    const insertDate = new Date(current.dataInsercao)
    const wasInsertedWithinCurrentPeriod = insertDate >= afterDate && insertDate <= beforeDate

    // Signing related checkings
    const signatureDate = current.ganho?.data ? new Date(current.ganho.data) : null
    const hasContractSigned = !!signatureDate
    const wasSignedWithinCurrentPeriod = hasContractSigned && signatureDate >= afterDate && signatureDate <= beforeDate
    const proposeValue = current.valorProposta
    const proposePeakPower = current.potenciaPicoProposta || 0

    // Increasing based on checkings
    if (seller) {
      if (wasSignedWithinCurrentPeriod) acc[seller.nome].potenciaVendida.atingido += proposePeakPower
      if (wasSignedWithinCurrentPeriod) acc[seller.nome].valorVendido.atingido += proposeValue
      if (wasSignedWithinCurrentPeriod) acc[seller.nome].projetosVendidos.atingido += 1
    }
    if (wasInsertedWithinCurrentPeriod) acc[seller?.nome || sdr?.nome || 'NÃO DEFINIDO'].projetosCriados.atingido += 1
    if (!!isTransfer && wasTransferedWithinCurrentPeriod && !!sdr) acc[sdr.nome].projetosEnviados.atingido += 1

    return acc
  }, initialResultsReduced)

  const response: TSalePromotersResults = Object.values(results)
    .map((value) => ({
      id: value.id,
      nome: value.nome,
      avatar_url: value.avatar_url,
      potenciaVendida: value.potenciaVendida,
      valorVendido: value.valorVendido,
      projetosVendidos: value.projetosVendidos,
      projetosCriados: value.projetosCriados,
      projetosEnviados: value.projetosEnviados,
      conversao: {
        objetivo: value.conversao.objetivo,
        atingido: value.projetosVendidos.atingido / value.projetosCriados.atingido,
      },
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome))

  return res.status(200).json({ data: response })
}
export default apiHandler({ GET: getSellersRoute })
type TPromotersResultsProject = {
  idMarketing: TOpportunity['idMarketing']
  responsaveis: TOpportunity['responsaveis']
  ganho: TOpportunity['ganho']
  valorProposta: TProposal['valor']
  potenciaPicoProposta: TProposal['potenciaPico']
  canalAquisicao: TClient['canalAquisicao']
  dataInsercao: string
}
type GetProjectsParams = {
  opportunitiesCollection: Collection<TOpportunity>

  afterDate: Date
  beforeDate: Date
}
async function getOpportunities({ opportunitiesCollection, afterDate, beforeDate }: GetProjectsParams) {
  try {
    const afterDateStr = afterDate.toISOString()
    const beforeDateStr = beforeDate.toISOString()
    const match = {
      $or: [
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
    })) as TPromotersResultsProject[]
    return projects
  } catch (error) {
    throw error
  }
}
// const applicableSaleGoal = goals.reduce((acc, current) => {
//     const monthsGoalReduced = Object.values(current.meses).reduce((acc, monthCurrent) => {
//       const afterDatetime = new Date(after).getTime()
//       const beforeDatetime = new Date(before).getTime()

//       const monthStartDatetime = new Date(monthCurrent.inicio).getTime()
//       const monthEndDatetime = new Date(monthCurrent.fim).getTime()

//       if (
//         (afterDatetime < monthStartDatetime && beforeDatetime < monthStartDatetime) ||
//         (afterDatetime > monthEndDatetime && beforeDatetime > monthEndDatetime)
//       )
//         return acc
//       // Caso o período de filtro da query compreenda o mês inteiro
//       if (afterDatetime <= monthStartDatetime && beforeDatetime >= monthEndDatetime) {
//         return (acc += monthCurrent.vendas)
//       } else {
//         if (beforeDatetime > monthEndDatetime) {
//           const applicableDays = dayjs(monthCurrent.fim).diff(dayjs(after), 'days')
//           console.log('CAI NO CASO 2 - CASO 1', applicableDays, after, before, monthCurrent.inicio, monthCurrent.fim)

//           return acc + (monthCurrent.vendas * applicableDays) / monthCurrent.dias
//         } else {
//           const applicableDays = dayjs(before).diff(dayjs(monthCurrent.inicio), 'days')
//           console.log('CAI NO CASO 2 - CASO 2', applicableDays, after, before, monthCurrent.inicio, monthCurrent.fim)

//           return acc + (monthCurrent.vendas * applicableDays) / monthCurrent.dias
//         }
//         return acc
//       }
//       return acc
//     }, 0)
//     return acc + monthsGoalReduced
//   }, 0)
