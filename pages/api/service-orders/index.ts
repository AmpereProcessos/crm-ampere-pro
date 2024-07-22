import { insertServiceOrder, updateServiceOrder } from '@/repositories/service-orders/mutations'
import { getServiceOrderById, getServiceOrders, getServiceOrdersByProjectId } from '@/repositories/service-orders/queries'
import connectToDatabase from '@/services/mongodb/crm-db-connection'
import { apiHandler, validateAuthenticationWithSession } from '@/utils/api'
import { TPurchase } from '@/utils/schemas/purchase.schema'
import { InsertServiceOrderSchema, TServiceOrder, TServiceOrderWithProject } from '@/utils/schemas/service-order.schema'
import createHttpError from 'http-errors'
import { update } from 'lodash'
import { Collection, ObjectId } from 'mongodb'
import { NextApiHandler } from 'next'

type GetResponse = {
  data: TServiceOrderWithProject | TServiceOrder[]
}

const getServiceOrdersRoute: NextApiHandler<GetResponse> = async (req, res) => {
  const session = await validateAuthenticationWithSession(req, res)
  const partnerScope = session.user.permissoes.parceiros.escopo

  const partnerQuery = partnerScope ? { idParceiro: { $in: partnerScope } } : {}
  const { id, projectId } = req.query

  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const collection: Collection<TServiceOrder> = db.collection('service-orders')

  if (id) {
    if (typeof id != 'string' || !ObjectId.isValid(id)) throw new createHttpError.BadRequest('ID inválido.')

    const serviceOrder = await getServiceOrderById({ id, collection, query: partnerQuery })
    if (!serviceOrder) throw new createHttpError.BadRequest('Ordem de serviço não encontrada.')

    return res.status(200).json({ data: serviceOrder })
  }
  if (projectId) {
    if (typeof projectId != 'string' || !ObjectId.isValid(projectId)) throw new createHttpError.BadRequest('ID projeto inválido.')

    const serviceOrders = await getServiceOrdersByProjectId({ projectId, collection, query: partnerQuery })

    return res.status(200).json({ data: serviceOrders })
  }

  const serviceOrders = await getServiceOrders({ collection, query: partnerQuery })

  return res.status(200).json({ data: serviceOrders })
}

type PostResponse = {
  data: { insertedId: string }
  message: string
}

const createServiceOrderRoute: NextApiHandler<PostResponse> = async (req, res) => {
  const session = await validateAuthenticationWithSession(req, res)

  const serviceOrder = InsertServiceOrderSchema.parse(req.body)

  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const collection: Collection<TServiceOrder> = db.collection('service-orders')

  const insertResponse = await insertServiceOrder({ info: serviceOrder, collection })
  if (!insertResponse.acknowledged) throw new createHttpError.InternalServerError('Oops, houve um erro desconhecido ao criar nova ordem de serviço.')

  const insertedId = insertResponse.insertedId.toString()

  return res.status(201).json({ data: { insertedId }, message: 'Ordem de serviço criada com sucesso !' })
}

type PutResponse = {
  data: string
  message: string
}

const editServiceOrderRoute: NextApiHandler<PutResponse> = async (req, res) => {
  const session = await validateAuthenticationWithSession(req, res)
  const partnerScope = session.user.permissoes.parceiros.escopo

  const partnerQuery = partnerScope ? { idParceiro: { $in: partnerScope } } : {}

  const { id } = req.query

  if (!id || typeof id != 'string' || !ObjectId.isValid(id)) throw new createHttpError.BadRequest('ID inválido.')

  const changes = InsertServiceOrderSchema.partial().parse(req.body)

  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const collection: Collection<TServiceOrder> = db.collection('service-orders')

  const updateResponse = await updateServiceOrder({ id, collection, changes, query: partnerQuery })
  if (updateResponse.matchedCount == 0) throw new createHttpError.NotFound('Ordem de serviço não encontrada.')
  if (!updateResponse.acknowledged) throw new createHttpError.BadRequest('Oops, houve um erro ao atualizar ordem de serviço.')

  return res.status(201).json({ data: 'Ordem de serviço atualizada com sucesso !', message: 'Ordem de serviço atualizada com sucesso !' })
}

export default apiHandler({ GET: getServiceOrdersRoute, POST: createServiceOrderRoute, PUT: editServiceOrderRoute })
