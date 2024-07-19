import { insertRevenue, updateRevenue } from '@/repositories/revenues/mutations'
import { getRevenueById, getRevenues, getRevenuesByProjectId } from '@/repositories/revenues/queries'
import connectToDatabase from '@/services/mongodb/crm-db-connection'
import { apiHandler, validateAuthenticationWithSession } from '@/utils/api'
import { InsertRevenueSchema, TRevenue } from '@/utils/schemas/revenues.schema'
import createHttpError from 'http-errors'
import { Collection, Filter, ObjectId } from 'mongodb'
import { NextApiHandler } from 'next'

type GetResponse = {
  data: TRevenue | TRevenue[]
}

const getRevenuesRoute: NextApiHandler<GetResponse> = async (req, res) => {
  // TODO: create specific permissions to validate authorization
  const session = await validateAuthenticationWithSession(req, res)
  const partnerScope = session.user.permissoes.parceiros.escopo

  const partnerQuery: Filter<TRevenue> = partnerScope ? { idParceiro: { $in: partnerScope } } : {}
  const { id, projectId } = req.query

  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const collection: Collection<TRevenue> = db.collection('revenues')

  if (id) {
    if (typeof id != 'string' || !ObjectId.isValid(id)) throw new createHttpError.BadRequest('ID inválido.')

    const revenue = await getRevenueById({ collection, id, query: partnerQuery })
    if (!revenue) throw new createHttpError.NotFound('Receita não encontrada.')
    return res.status(200).json({ data: revenue })
  }
  if (projectId) {
    if (typeof projectId != 'string' || !ObjectId.isValid(projectId)) throw new createHttpError.BadRequest('ID de projeto inválido.')

    const revenues = await getRevenuesByProjectId({ collection, projectId, query: partnerQuery })

    return res.status(200).json({ data: revenues })
  }

  const revenues = await getRevenues({ collection, query: partnerQuery })

  return res.status(200).json({ data: revenues })
}

type PostResponse = {
  data: { insertedId: string }
  message: string
}

const createRevenueRoute: NextApiHandler<PostResponse> = async (req, res) => {
  const session = await validateAuthenticationWithSession(req, res)

  const revenue = InsertRevenueSchema.parse(req.body)

  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const collection: Collection<TRevenue> = db.collection('revenues')

  const insertResponse = await insertRevenue({ collection, info: revenue })
  if (!insertResponse.acknowledged) throw new createHttpError.BadRequest('Oops, houve um erro desconhecido ao criar receita.')
  const insertedId = insertResponse.insertedId.toString()

  return res.status(201).json({ data: { insertedId }, message: 'Receita criada com sucesso !' })
}

type PutResponse = {
  data: string
  message: string
}

const editRevenueRoute: NextApiHandler<PutResponse> = async (req, res) => {
  const session = await validateAuthenticationWithSession(req, res)
  const partnerScope = session.user.permissoes.parceiros.escopo

  const partnerQuery: Filter<TRevenue> = partnerScope ? { idParceiro: { $in: partnerScope } } : {}
  const { id } = req.query
  if (!id || typeof id != 'string' || !ObjectId.isValid(id)) throw new createHttpError.BadRequest('ID inválido.')

  const changes = InsertRevenueSchema.partial().parse(req.body)

  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const collection: Collection<TRevenue> = db.collection('revenues')

  const updateResponse = await updateRevenue({ id, collection, changes, query: partnerQuery })
  if (!updateResponse.acknowledged) throw new createHttpError.InternalServerError('Oops, houve um erro desconhecido ao a')
  if (updateResponse.matchedCount == 0) throw new createHttpError.NotFound('Receita não encontrada.')
  return res.status(200).json({ data: 'Receita atualizada com sucesso !', message: 'Receita atualizada com sucesso !' })
}
export default apiHandler({ GET: getRevenuesRoute, POST: createRevenueRoute, PUT: editRevenueRoute })
