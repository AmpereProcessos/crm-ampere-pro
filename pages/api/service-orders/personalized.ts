import { updateServiceOrder } from '@/repositories/service-orders/mutations'
import connectToDatabase from '@/services/mongodb/crm-db-connection'
import { apiHandler, validateAuthenticationWithSession } from '@/utils/api'
import { TServiceOrder } from '@/utils/schemas/service-order.schema'
import createHttpError from 'http-errors'
import { Collection, Filter, ObjectId } from 'mongodb'
import { NextApiHandler } from 'next'

const editServiceOrderPersonalizedRoute: NextApiHandler<PutResponse> = async (req, res) => {
  const session = await validateAuthenticationWithSession(req, res)
  const partnerScope = session.user.permissoes.parceiros.escopo

  const partnerQuery: Filter<TServiceOrder> = partnerScope ? { idParceiro: { $in: partnerScope } } : {}
  const { id } = req.query
  if (!id || typeof id != 'string' || !ObjectId.isValid(id)) throw new createHttpError.BadRequest('ID inválido.')

  const changes = req.body
  console.log(req.body)
  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const collection: Collection<TServiceOrder> = db.collection('service-orders')

  const updateResponse = await updateServiceOrder({ id, collection, changes, query: partnerQuery })
  if (!updateResponse.acknowledged) throw new createHttpError.InternalServerError('Oops, houve um erro desconhecido ao atualizar ordem de serviço.')
  if (updateResponse.matchedCount == 0) throw new createHttpError.NotFound('Ordem de serviço não encontrada.')
  return res.status(200).json({ data: 'Ordem de serviço atualizada com sucesso !', message: 'Ordem de serviço atualizada com sucesso !' })
}

export default apiHandler({ PUT: editServiceOrderPersonalizedRoute })
