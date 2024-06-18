import { insertClient } from '@/repositories/clients/mutations'
import { getExistentClientByProperties } from '@/repositories/clients/queries'
import { insertFunnelReference } from '@/repositories/funnel-references/mutations'
import { insertOpportunity, insertOpportunityWithExistingClient } from '@/repositories/opportunities/mutations'
import connectToDatabase from '@/services/mongodb/crm-db-connection'
import { apiHandler, validateAuthenticationWithSession, validateAuthorization } from '@/utils/api'
import { InsertClientSchema, TClient } from '@/utils/schemas/client.schema'
import { InsertFileReferenceSchema } from '@/utils/schemas/file-reference.schema'
import { InsertFunnelReferenceSchema, TFunnelReference } from '@/utils/schemas/funnel-reference.schema'
import { InsertOpportunitySchema, TOpportunity } from '@/utils/schemas/opportunity.schema'
import createHttpError from 'http-errors'
import { Collection, ObjectId } from 'mongodb'
import { NextApiHandler } from 'next'
import { z } from 'zod'

type PostResponse = {
  data: {
    insertedClientId: string
    insertedOpportunityId: string
    insertedFunnelReferenceId: string
  }
  message: string
}

const CreateClientOpportunityAndFunnelReferencesSchema = z.object({
  clientId: z
    .string({
      required_error: 'ID de referência do cliente para vinculação não fornecido.',
      invalid_type_error: 'Tipo não válido para ID de referência do cliente para vinculação.',
    })
    .nullable(),
  client: InsertClientSchema,
  opportunity: InsertOpportunitySchema,
  funnelReference: InsertFunnelReferenceSchema,
})

const createClientOpportunityAndFunnelReferences: NextApiHandler<PostResponse> = async (req, res) => {
  const session = await validateAuthenticationWithSession(req, res)
  const partnerId = session.user.idParceiro
  const hasGeneralClientScope = session.user.permissoes.clientes.criar && !session.user.permissoes.clientes.escopo
  // Validating creation permissions
  const userHasClientCreationPermission = session.user.permissoes.clientes.criar
  const userHasOpportunityCreationPermission = session.user.permissoes.oportunidades.criar
  if (!userHasClientCreationPermission) throw new createHttpError.BadRequest('Usuário não possui permissão para criação de cliente.')
  if (!userHasOpportunityCreationPermission) throw new createHttpError.BadRequest('Usuário não possui permissão para criação de oportunidade.')

  const { clientId, client, opportunity, funnelReference } = CreateClientOpportunityAndFunnelReferencesSchema.parse(req.body)

  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const opportunitiesCollection: Collection<TOpportunity> = db.collection('opportunities')
  const clientsCollection: Collection<TClient> = db.collection('clients')
  const funnelReferencesCollection: Collection<TFunnelReference> = db.collection('funnel-references')
  if (clientId) {
    console.log('PASSOU PELO CAMINHO DE VINCULAÇÃO DE CLIENTE EXISTENTE')
    // If there is a client ID, then the opportunity will be reference to an existing client, therefore, there is no need to create a new client
    if (typeof clientId != 'string' || !ObjectId.isValid(clientId)) throw new createHttpError.BadRequest('ID de cliente inválido.')

    // Creating opportunity with idCliente referencing the clientId provided
    const insertOpportunityResponse = await insertOpportunity({
      collection: opportunitiesCollection,
      info: { ...opportunity, idCliente: clientId },
      partnerId: partnerId || '',
    })
    if (!insertOpportunityResponse.acknowledged) throw new createHttpError.InternalServerError('Oops, houve um erro desconhecido ao criar oportunidade.')
    const insertedOpportunityId = insertOpportunityResponse.insertedId.toString()
    console.log('CLIENTE EXISTENTE - ID DA OPORTUNIDADE', insertedOpportunityId)
    // Creating funnel reference referencing the inserted opportunity id
    const insertFunnelReferenceResponse = await insertFunnelReference({
      collection: funnelReferencesCollection,
      info: {
        ...funnelReference,
        idOportunidade: insertedOpportunityId,
        estagios: { [`${funnelReference.idEstagioFunil}`]: { entrada: new Date().toISOString() } },
      },
      partnerId: partnerId || '',
    })
    if (!insertFunnelReferenceResponse.acknowledged) throw new createHttpError.InternalServerError('Oops, houve um erro desconhecido ao criar oportunidade.')
    const insertedFunnelReferenceId = insertFunnelReferenceResponse.insertedId.toString()
    console.log('CLIENTE EXISTENTE - ID DA REFERÊNCIA DE FUNIL', insertedOpportunityId)
    return res.status(200).json({
      data: { insertedClientId: clientId, insertedOpportunityId: insertedOpportunityId, insertedFunnelReferenceId: insertedFunnelReferenceId },
      message: 'Oportunidade criada com sucesso !',
    })
  }
  console.log('PASSOU PELO CAMINHO DE CRIAÇÃO DE NOVO CLIENTE')
  // In case there was not provided an client ID, then, creating client, opportunity and funnel reference in a row
  // Refering which inserted object id in the next one, so clientID to opportunity, and opportunityId to funnel reference

  // First, checking if client already existing in partner's client database
  const email = client.email || undefined
  const cpfCnpj = client.cpfCnpj || undefined
  const phoneNumber = client.telefonePrimario
  const existingClientInDb = await getExistentClientByProperties({ collection: clientsCollection, email, cpfCnpj, phoneNumber })
  if (!!existingClientInDb) throw new createHttpError.BadRequest('Cliente já existente. Não é permitida a duplicação de clientes.')

  const insertClientResponse = await insertClient({ collection: clientsCollection, info: client, partnerId: partnerId || '' })
  if (!insertClientResponse.acknowledged) throw new createHttpError.InternalServerError('Oops, houve um erro desconhecido ao criar cliente.')
  const insertedClientId = insertClientResponse.insertedId.toString()
  console.log('ID DO CLIENTE', insertedClientId)
  const insertOpportunityResponse = await insertOpportunity({
    collection: opportunitiesCollection,
    info: { ...opportunity, idCliente: insertedClientId },
    partnerId: partnerId || '',
  })
  if (!insertOpportunityResponse.acknowledged) throw new createHttpError.InternalServerError('Oops, houve um erro desconhecido ao criar oportunidade.')
  const insertedOpportunityId = insertOpportunityResponse.insertedId.toString()
  console.log('ID DA OPORTUNIDADE', insertedOpportunityId)
  const insertFunnelReferenceResponse = await insertFunnelReference({
    collection: funnelReferencesCollection,
    info: {
      ...funnelReference,
      idOportunidade: insertedOpportunityId,
      estagios: { [`${funnelReference.idEstagioFunil}`]: { entrada: new Date().toISOString() } },
    },
    partnerId: partnerId || '',
  })
  if (!insertFunnelReferenceResponse.acknowledged) throw new createHttpError.InternalServerError('Oops, houve um erro desconhecido ao criar oportunidade.')
  const insertedFunnelReferenceId = insertFunnelReferenceResponse.insertedId.toString()
  console.log('ID DA REFERÊNCIA DO FUNIL', insertedFunnelReferenceId)
  return res.status(201).json({ data: { insertedClientId, insertedOpportunityId, insertedFunnelReferenceId }, message: 'Oportunidade criada com sucesso !' })
}

export default apiHandler({ POST: createClientOpportunityAndFunnelReferences })
