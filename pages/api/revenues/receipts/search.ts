import { getReceiptsByFilters } from '@/repositories/revenues/queries'
import connectToDatabase from '@/services/mongodb/crm-db-connection'
import { apiHandler, validateAuthenticationWithSession } from '@/utils/api'
import { TReceipt, TRevenue } from '@/utils/schemas/revenues.schema'
import createHttpError from 'http-errors'
import { Collection } from 'mongodb'
import { NextApiHandler } from 'next'
import { z } from 'zod'

const QueryParamsSchema = z.object({
  page: z.string({ required_error: 'Parâmetro de páginação não informado.' }),
})

export type TReceiptsByFiltersResult = { receipts: TReceipt[]; receiptsMatched: number; totalPages: number }

type PostResponse = {
  data: TReceiptsByFiltersResult
}

const getReceiptsByPersonalizedFiltersRoute: NextApiHandler<PostResponse> = async (req, res) => {
  const PAGE_SIZE = 50
  const session = await validateAuthenticationWithSession(req, res)

  const { page } = QueryParamsSchema.parse(req.query)

  // Validating page parameter
  if (!page || isNaN(Number(page))) throw new createHttpError.BadRequest('Parâmetro de paginação inválido ou não informado.')

  const skip = PAGE_SIZE * (Number(page) - 1)
  const limit = PAGE_SIZE
  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const collection: Collection<TRevenue> = db.collection('revenues')

  const { receipts, receiptsMatched } = await getReceiptsByFilters({ collection, query: {}, limit, skip })

  const totalPages = Math.round(receiptsMatched / PAGE_SIZE)

  return res.status(200).json({ data: { receipts, receiptsMatched, totalPages } })
}

export default apiHandler({ POST: getReceiptsByPersonalizedFiltersRoute })
