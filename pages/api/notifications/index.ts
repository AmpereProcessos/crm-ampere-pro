import { insertNotification, updateNotification } from '@/repositories/notifications/mutations'
import { getNotificationById, getNotificationByOpportunityId, getNotificationByRecipientId } from '@/repositories/notifications/queries'
import connectToDatabase from '@/services/mongodb/crm-db-connection'
import { apiHandler, validateAuthentication, validateAuthenticationWithSession } from '@/utils/api'

import { InsertNotificationSchema, TNotification } from '@/utils/schemas/notification.schema'

import createHttpError from 'http-errors'
import { Collection, ObjectId } from 'mongodb'
import { NextApiHandler } from 'next'
import { z } from 'zod'

type PostResponse = {
  data: { insertedId: string }
  message: string
}

const createNotification: NextApiHandler<PostResponse> = async (req, res) => {
  const session = await validateAuthenticationWithSession(req, res)
  const partnerId = session.user.idParceiro

  const notification = InsertNotificationSchema.parse(req.body)

  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const collection: Collection<TNotification> = db.collection('notifications')

  const insertResponse = await insertNotification({ collection: collection, info: notification, partnerId: partnerId || '' })
  if (!insertResponse.acknowledged) throw new createHttpError.InternalServerError('Oops, houve um erro desconhecido ao criar notificação.')
  const insertedId = insertResponse.insertedId.toString()

  return res.status(201).json({ data: { insertedId }, message: 'Notificação criada com sucesso !' })
}

type GetResponse = {
  data: TNotification | TNotification[]
}
const getNotifications: NextApiHandler<GetResponse> = async (req, res) => {
  const session = await validateAuthenticationWithSession(req, res)

  const { id, recipientId, opportunityId } = req.query

  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const collection: Collection<TNotification> = db.collection('notifications')

  if (id) {
    if (typeof id != 'string' || !ObjectId.isValid(id)) throw new createHttpError.BadRequest('ID de notificação inválido.')

    const notification = await getNotificationById({ collection: collection, id: id })
    if (!notification) throw new createHttpError.NotFound('Notificação não encontrada.')
    return res.status(200).json({ data: notification })
  }
  if (recipientId) {
    if (typeof recipientId != 'string' || !ObjectId.isValid(recipientId)) throw new createHttpError.BadRequest('ID de destinatário inválido.')

    const notifications = await getNotificationByRecipientId({ collection: collection, recipientId: recipientId })

    return res.status(200).json({ data: notifications })
  }
  if (opportunityId) {
    if (typeof opportunityId != 'string' || !ObjectId.isValid(opportunityId)) throw new createHttpError.BadRequest('ID de destinatário inválido.')

    const notifications = await getNotificationByOpportunityId({ collection: collection, opportunityId: opportunityId })

    return res.status(200).json({ data: notifications })
  }
  return res.status(200).json({ data: [] })
}

type PutResponse = {
  data: string
  message: string
}

const editNotification: NextApiHandler<PutResponse> = async (req, res) => {
  const session = await validateAuthenticationWithSession(req, res)
  const partnerId = session.user.idParceiro

  const { id } = req.query
  if (!id || typeof id != 'string' || !ObjectId.isValid(id)) throw new createHttpError.BadRequest('ID inválido.')

  const changes = InsertNotificationSchema.partial().parse(req.body)

  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const collection: Collection<TNotification> = db.collection('notifications')

  const updateResponse = await updateNotification({ id: id, collection: collection, info: changes, query: {} })
  if (!updateResponse.acknowledged) throw new createHttpError.InternalServerError('Oops, houve um erro desconhecido ao atualizar notificação.')
  if (updateResponse.matchedCount == 0) throw new createHttpError.NotFound('Notificação não encontrada.')

  return res.status(201).json({ data: 'Notificação atualizada.', message: 'Notificação atualizada.' })
}
export default apiHandler({
  POST: createNotification,
  GET: getNotifications,
  PUT: editNotification,
})
