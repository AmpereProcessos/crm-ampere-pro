import { NextApiHandler } from 'next'
import { ISession } from '../../../utils/models'

import { apiHandler, validateAuthentication, validateAuthorization } from '@/utils/api'
import connectToDatabase from '@/services/mongodb/crm-db-connection'
import { Collection, Db, Filter, MatchKeysAndValues, ObjectId } from 'mongodb'
import createHttpError from 'http-errors'

import { isInvalidMongoId } from '@/lib/methods/validation'

import { InsertClientSchema, TClient } from '@/utils/schemas/client.schema'
import { getClientById, getClients, getExistentClientByProperties } from '@/repositories/clients/queries'
import { insertClient, updateClient } from '@/repositories/clients/mutations'
type PostResponse = {
  data: {
    insertedId: string
  }
  message: string
}

const createClient: NextApiHandler<PostResponse> = async (req, res) => {
  const session = await validateAuthorization(req, res, 'clientes', 'criar', true)
  const partnerId = session.user.idParceiro
  const client = InsertClientSchema.parse(req.body)
  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const collection: Collection<TClient> = db.collection('clients')
  const email = client.email || undefined
  const cpfCnpj = client.cpfCnpj || undefined
  const phoneNumber = client.telefonePrimario
  const existingClientInDb = await getExistentClientByProperties({ collection, email, cpfCnpj, phoneNumber })
  if (!!existingClientInDb) {
    throw new createHttpError.BadRequest('Cliente com essas informações já foi criado.')
  }
  let insertResponse = await insertClient({ collection: collection, info: client, partnerId: partnerId || '' })

  if (!insertResponse.acknowledged) throw new createHttpError.InternalServerError('Oops, houve um erro desconhecido na criação do cliente.')
  const insertedId = insertResponse.insertedId.toString()
  return res.status(201).json({ data: { insertedId: insertedId }, message: 'Cliente criado com sucesso.' })
}

type GetResponse = {
  data: TClient[] | TClient
}

const getPartnerClients: NextApiHandler<GetResponse> = async (req, res) => {
  const session = await validateAuthorization(req, res, 'clientes', 'visualizar', true)
  const partnerId = session.user.idParceiro
  const userScope = session.user.permissoes.clientes.escopo
  const parterScope = session.user.permissoes.parceiros.escopo
  const partnerQuery: Filter<TClient> = parterScope ? { idParceiro: { $in: [...parterScope] } } : {}

  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const collection: Collection<TClient> = db.collection('clients')

  const { id, author } = req.query

  // In case there is an ID, querying for a specific client within the partners clients
  if (id) {
    if (typeof id != 'string' || !ObjectId.isValid(id)) throw new createHttpError.BadRequest('ID inválido.')
    const client = await getClientById({ collection: collection, id: id, query: partnerQuery })

    if (!client) throw new createHttpError.NotFound('Cliente não encontrado.')

    return res.status(200).json({ data: client as TClient })
  }

  // Else, structuring a db query based on the request query params and the user's
  // permitions

  var queryParam: MatchKeysAndValues<TClient> = {}
  if (typeof author != 'string') throw 'ID de representante inválido.'

  // Validing user scope visibility
  if (!!userScope && !userScope.includes(author)) throw new createHttpError.BadRequest('Seu escopo de visibilidade não contempla esse usuário.')

  if (author != 'null') queryParam = { 'autor.id': author }
  console.log(queryParam)
  const clients = await getClients({ collection: collection, partnerId: partnerId || '', queryParam: queryParam })

  res.status(200).json({ data: clients })
}

type PutResponse = {
  data: string
  message: string
}

const editClients: NextApiHandler<PutResponse> = async (req, res) => {
  const session = await validateAuthorization(req, res, 'clientes', 'editar', true)
  const partnerId = session.user.idParceiro
  const parterScope = session.user.permissoes.parceiros.escopo
  const partnerQuery: Filter<TClient> = parterScope ? { idParceiro: { $in: [...parterScope] } } : {}

  const { id } = req.query
  const changes = InsertClientSchema.partial().parse(req.body)
  // if(session.user.id)

  if (!id || typeof id != 'string' || !ObjectId.isValid(id)) throw new createHttpError.BadRequest('ID de cliente inválido.')

  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const clientsCollection: Collection<TClient> = db.collection('clients')

  const client = await getClientById({ collection: clientsCollection, id: id, query: partnerQuery })
  if (!client) throw new createHttpError.NotFound('Cliente não encontrado.')

  const updateResponse = await updateClient({ id: id, collection: clientsCollection, changes: changes, query: partnerQuery })

  if (!updateResponse.acknowledged) throw new createHttpError.InternalServerError('Oops, houve um erro desconhecido na atualização do cliente.')
  return res.status(201).json({ data: 'Cliente alterado com sucesso !', message: 'Cliente alterado com sucesso !' })
}
export default apiHandler({
  POST: createClient,
  GET: getPartnerClients,
  PUT: editClients,
})
type ValidateEditAuthorizationParams = {
  clientsCollection: Collection
  projectsCollection: Collection
  session: ISession
  clientId: string
  projectId: string | string[] | undefined
}

async function validateEditAuthorization({ clientsCollection, projectsCollection, session, clientId, projectId }: ValidateEditAuthorizationParams) {
  const requesterHasGeneralEditPermission = session.user.permissoes.clientes.editar
  console.log('USER HAS OVERALL PERMISSION', requesterHasGeneralEditPermission)
  // If requester has overall edit permission, return pass
  if (requesterHasGeneralEditPermission) return true
  const requesterId = session.user.id
  const representativeId = await getClientRepresentative({ collection: clientsCollection, clientId: clientId })
  console.log('ID REPRESENTATIVE', representativeId)
  // In case of no projectId provided, validating if the requester is the client's representative
  if (requesterId == representativeId) return true
  if (!projectId || isInvalidMongoId(projectId)) throw new createHttpError.BadRequest('ID de projeto inválido.')
  // Validating if requester is either the client's representative or the project's responsible
  const responsibleId = await getProjectResponsible({ collection: projectsCollection, projectId: projectId as string })
  console.log('ID RESPONSIBLE', responsibleId)
  return requesterId == responsibleId
}

type GetProjectResponsibleAndRepresentativeParams = {
  collection: Collection
  projectId: string | undefined
}
async function getProjectResponsible({ collection, projectId }: GetProjectResponsibleAndRepresentativeParams) {
  try {
    const projectSimplified = await collection.findOne({ _id: new ObjectId(projectId) }, { projection: { responsavel: 1 } })
    if (!projectSimplified) throw new createHttpError.NotFound('Projeto não encontrado.')
    return projectSimplified.responsavel.id as string
  } catch (error) {
    throw error
  }
}
type GetClientRepresentativeParams = {
  collection: Collection
  clientId: string
}
async function getClientRepresentative({ collection, clientId }: GetClientRepresentativeParams) {
  try {
    const clienteSimplified = await collection.findOne({ _id: new ObjectId(clientId) }, { projection: { representante: 1 } })
    if (!clienteSimplified) throw new createHttpError.NotFound('Cliente não encontrado.')
    return clienteSimplified.representante.id as string
  } catch (error) {
    throw error
  }
}
