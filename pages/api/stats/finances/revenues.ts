import connectToDatabase from '@/services/mongodb/crm-db-connection'
import { validateAuthorization } from '@/utils/api'
import { TRevenue } from '@/utils/schemas/revenues.schema'
import { Collection, Filter } from 'mongodb'
import { NextApiHandler } from 'next'
import { z } from 'zod'

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

  const db = await connectToDatabase(process.env.MONGODB_URI, 'main')
  const collection: Collection<TRevenue> = db.collection('revenues')
}

type GetRevenuesParams = {
  collection: Collection<TRevenue>
  after: string
  before: string
}
async function getRevenues({ collection, after, before }: GetRevenuesParams) {}
