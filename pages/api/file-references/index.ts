import { insertFileReference } from '@/repositories/file-references/mutation'
import {
  getFileReferencesByAnalysisId,
  getFileReferencesByClientId,
  getFileReferencesByHomologationId,
  getFileReferencesByOpportunityId,
} from '@/repositories/file-references/queries'
import connectToDatabase from '@/services/mongodb/crm-db-connection'
import { apiHandler, validateAuthentication, validateAuthenticationWithSession } from '@/utils/api'
import { InsertFileReferenceSchema, TFileReference, TFileReferenceEntity } from '@/utils/schemas/file-reference.schema'
import createHttpError from 'http-errors'
import { Collection, Filter, ObjectId } from 'mongodb'
import { NextApiHandler } from 'next'

type PostResponse = {
  data: {
    insertedId: string
  }
  message: string
}

const createFileReference: NextApiHandler<PostResponse> = async (req, res) => {
  const session = await validateAuthenticationWithSession(req, res)
  const partnerId = session.user.idParceiro
  const parterScope = session.user.permissoes.parceiros.escopo
  const partnerQuery: Filter<TFileReference> = parterScope ? { idParceiro: { $in: [...parterScope] } } : {}

  // Parsing payload and validating fields
  const fileReference = InsertFileReferenceSchema.parse(req.body)

  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const collection: Collection<TFileReference> = db.collection('file-references')

  const insertResponse = await insertFileReference({ collection: collection, info: fileReference, partnerId: partnerId || '' })
  if (!insertResponse.acknowledged) throw new createHttpError.InternalServerError('Oops, houve um erro desconhecido no anexo do arquivo.')
  return res.status(201).json({ data: { insertedId: insertResponse.insertedId.toString() }, message: 'Arquivo anexado com sucesso !' })
}
type GetResponse = {
  data: TFileReferenceEntity | TFileReferenceEntity[]
}
const getFileReferences: NextApiHandler<GetResponse> = async (req, res) => {
  const session = await validateAuthenticationWithSession(req, res)
  const partnerId = session.user.idParceiro
  const parterScope = session.user.permissoes.parceiros.escopo
  const partnerQuery: Filter<TFileReference> = parterScope ? { idParceiro: { $in: [...parterScope] } } : {}

  const { opportunityId, clientId, analysisId, homologationId } = req.query
  // if (!opportunityId && !clientId && analysisId) throw new createHttpError.BadRequest('Necessário ID de referência do arquivo.')

  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const collection: Collection<TFileReference> = db.collection('file-references')

  if (opportunityId) {
    if (typeof opportunityId != 'string' || !ObjectId.isValid(opportunityId)) throw new createHttpError.BadRequest('ID de oportunidade inválido.')

    const references = await getFileReferencesByOpportunityId({
      collection: collection,
      opportunityId: opportunityId,
      query: partnerQuery,
    })

    return res.status(200).json({ data: references })
  }
  if (clientId) {
    if (typeof clientId != 'string' || !ObjectId.isValid(clientId)) throw new createHttpError.BadRequest('ID de cliente inválido.')
    const fileReferences = await getFileReferencesByClientId({ collection: collection, clientId: clientId, partnerId: partnerId || '' })
    return res.status(200).json({ data: fileReferences })
  }
  if (analysisId) {
    if (typeof analysisId != 'string' || !ObjectId.isValid(analysisId)) throw new createHttpError.BadRequest('ID de análise técnica inválido.')
    const fileReferences = await getFileReferencesByAnalysisId({ collection: collection, analysisId: analysisId, partnerId: partnerId || '' })
    return res.status(200).json({ data: fileReferences })
  }
  if (homologationId) {
    if (typeof homologationId != 'string' || !ObjectId.isValid(homologationId)) throw new createHttpError.BadRequest('ID de homologação inválido.')

    const fileReferences = await getFileReferencesByHomologationId({ collection: collection, homologationId: homologationId, partnerId: partnerId || '' })

    return res.status(200).json({ data: fileReferences })
  }
  return res.status(200).json({ data: [] })
}
export default apiHandler({
  GET: getFileReferences,
  POST: createFileReference,
})
