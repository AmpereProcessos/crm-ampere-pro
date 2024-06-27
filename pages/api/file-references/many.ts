import { insertManyFileReferences } from '@/repositories/file-references/mutation'
import { getFileReferencesByOpportunityId, getFileReferencesByQuery } from '@/repositories/file-references/queries'
import connectToDatabase from '@/services/mongodb/crm-db-connection'
import { apiHandler, validateAuthenticationWithSession } from '@/utils/api'
import { FileReferencesQueryParamsSchema, InsertFileReferenceSchema, TFileReference } from '@/utils/schemas/file-reference.schema'
import createHttpError from 'http-errors'
import { Collection, Filter } from 'mongodb'
import { NextApiHandler } from 'next'
import { z } from 'zod'

type GetResponse = {
  data: TFileReference[]
}

const getMultipleSourcesFileReferences: NextApiHandler<GetResponse> = async (req, res) => {
  const session = await validateAuthenticationWithSession(req, res)

  const { clientId, opportunityId, analysisId, homologationId, projectId, purchaseId } = FileReferencesQueryParamsSchema.parse(req.query)

  const clientQuery: Filter<TFileReference> = clientId ? { idCliente: clientId } : {}
  const opportunityQuery: Filter<TFileReference> = opportunityId ? { idOportunidade: opportunityId } : {}
  const analysisQuery: Filter<TFileReference> = analysisId ? { idAnaliseTecnica: analysisId } : {}
  const homologationQuery: Filter<TFileReference> = homologationId ? { idHomologacao: homologationId } : {}
  const projectQuery: Filter<TFileReference> = projectId ? { idProjeto: projectId } : {}
  const purchaseQuery: Filter<TFileReference> = purchaseId ? { idCompra: purchaseId } : {}

  const nonEmptyQueries = [clientQuery, opportunityQuery, analysisQuery, homologationQuery, projectQuery, purchaseQuery].filter(
    (r) => Object.keys(r).length > 0
  )
  const orQuery = { $or: nonEmptyQueries }
  const query = { ...orQuery }

  console.log(query)
  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const collection: Collection<TFileReference> = db.collection('file-references')

  const fileReferences = await getFileReferencesByQuery({ collection, query })
  return res.status(200).json({ data: fileReferences })
}

type PostResponse = {
  data: {
    insertedIds: string[]
  }
  message: string
}
const createManyFileReferences: NextApiHandler<PostResponse> = async (req, res) => {
  const session = await validateAuthenticationWithSession(req, res)
  const partnerId = session.user.idParceiro

  const manyAnalysis = z.array(InsertFileReferenceSchema).parse(req.body)

  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const fileReferencesCollection: Collection<TFileReference> = db.collection('file-references')

  const insertResponse = await insertManyFileReferences({ collection: fileReferencesCollection, info: manyAnalysis, partnerId: partnerId || '' })
  if (!insertResponse.acknowledged) throw new createHttpError.InternalServerError('Oops, houve um erro desconhecido na criação das referências de arquivo.')
  const insertedIds = Object.values(insertResponse.insertedIds).map((i) => i.toString())

  return res.status(201).json({ data: { insertedIds }, message: 'Referências de arquivo criadas com sucesso !' })
}

export default apiHandler({
  GET: getMultipleSourcesFileReferences,
  POST: createManyFileReferences,
})
