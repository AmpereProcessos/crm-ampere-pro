import connectToDatabase from '@/services/mongodb/crm-db-connection'
import { validateAuthorization } from '@/utils/api'
import { TProject } from '@/utils/schemas/project.schema'
import { TRevenue } from '@/utils/schemas/revenues.schema'
import dayjs from 'dayjs'
import { Collection, Filter } from 'mongodb'
import { NextApiHandler } from 'next'
import { z } from 'zod'

type TRevenueStatsReduced = {
  total: number
  totalRecebido: number
  totalAReceber: number
  diario: {
    [key: string]: {
      previsto: number
      efetivo: number
    }
  }
}

type PostResponse = {}

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

  const partners: string[] = []
  const partnerQuery: Filter<TRevenue> = partners ? { idParceiro: { $in: [...partners] } } : {}

  const afterDate = dayjs(after).startOf('day').subtract(3, 'hour').toDate()
  const beforeDate = dayjs(before).endOf('day').subtract(3, 'hour').toDate()

  const db = await connectToDatabase(process.env.MONGODB_URI, 'main')
  const collection: Collection<TRevenue> = db.collection('revenues')

  const revenues = await getRevenues({ collection, afterDate, beforeDate, query: partnerQuery })

  const results = revenues.reduce(
    (acc: TRevenueStatsReduced, current) => {
      const currentTotal = current.total
      return acc
    },
    { total: 0, totalRecebido: 0, totalAReceber: 0, diario: {} }
  )
}

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
