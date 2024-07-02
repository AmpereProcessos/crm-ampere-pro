import { getDayStringsBetweenDates, getFixedDate } from '@/lib/methods/dates'
import connectToDatabase from '@/services/mongodb/crm-db-connection'
import { apiHandler, validateAuthorization } from '@/utils/api'
import { TProject } from '@/utils/schemas/project.schema'
import { GeneralRevenueFiltersSchema, TRevenue } from '@/utils/schemas/revenues.schema'
import dayjs from 'dayjs'
import { Collection, Filter } from 'mongodb'
import { NextApiHandler } from 'next'
import { z } from 'zod'

export type TRevenueStatsResults = {
  total: number
  totalRecebido: number
  totalAReceber: number
  totalAReceberHoje: number
  totalAReceberEmAtraso: number
  diario: {
    dia: string
    previsto: number
    efetivo: number
  }[]
}

type TRevenueStatsReduced = {
  total: number
  totalRecebido: number
  totalAReceber: number
  totalAReceberHoje: number
  totalAReceberEmAtraso: number
  diario: {
    [key: string]: {
      previsto: number
      efetivo: number
    }
  }
}

type PostResponse = {
  data: TRevenueStatsResults
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
const getRevenuesStatsRoute: NextApiHandler<PostResponse> = async (req, res) => {
  const session = await validateAuthorization(req, res, 'resultados', 'visualizarOperacional', true)
  const partnerScope = session.user.permissoes.parceiros.escopo

  const { after, before } = QueryDatesSchema.parse(req.query)
  const { partners, projectTypes } = GeneralRevenueFiltersSchema.parse(req.body)

  const partnerQuery: Filter<TRevenue> = partners ? { idParceiro: { $in: [...partners] } } : {}
  const projectTypesQuery: Filter<TRevenue> = projectTypes ? { 'projeto.tipo': { $in: [...projectTypes] } } : {}

  const query: Filter<TRevenue> = { ...partnerQuery, ...projectTypesQuery }

  const afterDate = dayjs(after).startOf('day').subtract(3, 'hour').toDate()
  const beforeDate = dayjs(before).endOf('day').toDate()

  console.log(afterDate, beforeDate)
  const initialDate = dayjs(after).add(3, 'hour').toISOString()
  const endDate = dayjs(before).endOf('day').add(3, 'hour').toISOString()
  const datesStrs = getDayStringsBetweenDates({ initialDate, endDate })

  const db = await connectToDatabase(process.env.MONGODB_URI, 'main')
  const collection: Collection<TRevenue> = db.collection('revenues')

  const revenues = await getRevenues({ collection, afterDate, beforeDate, query: query })
  const initialReducedAcc: TRevenueStatsReduced = {
    total: 0,
    totalRecebido: 0,
    totalAReceber: 0,
    totalAReceberHoje: 0,
    totalAReceberEmAtraso: 0,
    diario: datesStrs.reduce((acc: TRevenueStatsReduced['diario'], current) => {
      acc[current] = { previsto: 0, efetivo: 0 }
      return acc
    }, {}),
  }
  const reduced = revenues.reduce((acc: TRevenueStatsReduced, current) => {
    const revenueTotal = current.total
    const competenceDay = new Date(current.dataCompetencia)

    // Updating the total if revenue competence is within the current period
    const isCompetentWithinCurrentPeriod = competenceDay >= afterDate && competenceDay <= beforeDate
    if (isCompetentWithinCurrentPeriod) acc.total += revenueTotal

    // Iterating through the receipts to update the other fields
    current.recebimentos.forEach((receipt) => {
      const receiptValue = receipt.valor
      const receiptDate = receipt.dataRecebimento ? getFixedDate(receipt.dataRecebimento, 'start') : null
      const receiptDay = dayjs(receiptDate).format('DD/MM')

      const wasReceived = !!receipt.efetivado
      if (wasReceived && !!receiptDate) {
        // In case it was received and within the current period, updating the totalRecebido field and the corresponding day
        // efective field
        const wasReceivedWithinCurrentPeriod = receiptDate >= afterDate && receiptDate <= beforeDate
        if (wasReceivedWithinCurrentPeriod) {
          acc.totalRecebido += receiptValue
          acc.diario[receiptDay].efetivo += receiptValue
        }
      } else {
        // In case it was not received it

        // Updating the totalAReceber field
        acc.totalAReceber += receiptValue

        // Defining flags based on the receipt date
        const receiptIsWithinCurrentPeriod = receiptDate && receiptDate >= afterDate && receiptDate <= beforeDate
        const receiptIsForToday = receiptDate && dayjs(receiptDate).isSame(new Date(), 'day')
        const receiptIsOverdue = receiptDate && dayjs(receiptDate).isBefore(new Date())

        // In case the flag receiptIsForToday is true (for receipts due to today), updating the totalAReceberHoje
        if (receiptIsForToday) acc.totalAReceberHoje += receiptValue
        // In case the flag receiptIsOverdue is true (for overdue receipts), updating the totalAReceberEmAtraso
        if (receiptIsOverdue) acc.totalAReceberEmAtraso += receiptValue
        // In case the flag receiptIsWithinCurrentPeriod is true (for receipts within the period of filter), updating the corresponding
        // day previsto field
        if (receiptIsWithinCurrentPeriod) acc.diario[receiptDay].previsto += receiptValue
      }
    })
    return acc
  }, initialReducedAcc)
  const results: TRevenueStatsResults = {
    total: reduced.total,
    totalRecebido: reduced.totalRecebido,
    totalAReceber: reduced.totalAReceber,
    totalAReceberHoje: reduced.totalAReceberHoje,
    totalAReceberEmAtraso: reduced.totalAReceberEmAtraso,
    diario: Object.entries(reduced.diario).map(([key, value]) => ({ dia: key, ...value })),
  }
  return res.status(200).json({ data: results })
}

export default apiHandler({ POST: getRevenuesStatsRoute })

type GetRevenuesParams = {
  collection: Collection<TRevenue>
  afterDate: Date
  beforeDate: Date
  query: Filter<TRevenue>
}
type TRevenueResult = {
  tipoProjeto: TProject['tipo']['titulo']
  total: TRevenue['total']
  dataCompetencia: TRevenue['dataCompetencia']
  recebimentos: TRevenue['recebimentos']
  dataInsercao: TRevenue['dataInsercao']
}
async function getRevenues({ collection, afterDate, beforeDate, query }: GetRevenuesParams) {
  const afterDateStr = afterDate.toISOString()
  const beforeDateStr = beforeDate.toISOString()
  const match: Filter<TRevenue> = {
    ...query,
    $or: [
      { $and: [{ dataInsercao: { $gte: afterDateStr } }, { dataInsercao: { $lte: beforeDateStr } }] },
      { $and: [{ dataCompetencia: { $gte: afterDateStr } }, { dataCompetencia: { $lte: beforeDateStr } }] },
      { $and: [{ 'recebimentos.dataRecebimento': { $gte: afterDateStr } }, { 'recebimentos.dataRecebimento': { $lte: beforeDateStr } }] },
    ],
  }
  const projection = {
    'projeto.tipo': 1,
    total: 1,
    dataCompetencia: 1,
    recebimentos: 1,
    dataInsercao: 1,
  }
  const result = await collection.aggregate([{ $match: match }, { $project: projection }]).toArray()

  const revenues = result.map((r) => ({
    tipoProjeto: r.projeto.tipo,
    total: r.total,
    dataCompetencia: r.dataCompetencia,
    recebimentos: r.recebimentos,
    dataInsercao: r.dataInsercao,
  })) as TRevenueResult[]

  return revenues
}
