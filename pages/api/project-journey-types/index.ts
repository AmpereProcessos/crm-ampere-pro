import { insertProjectJourneyType, updateProjectJourneyType } from '@/repositories/project-journey-types/mutations'
import { getProjectJourneyTypeById, getProjectJourneyTypes } from '@/repositories/project-journey-types/queries'
import connectToDatabase from '@/services/mongodb/crm-db-connection'
import { apiHandler, validateAuthentication, validateAuthenticationWithSession, validateAuthorization } from '@/utils/api'
import { InsertProjectJourneyTypeSchema, TProjectJourneyType } from '@/utils/schemas/project-journey-types'
import createHttpError from 'http-errors'
import { Collection, ObjectId } from 'mongodb'
import { NextApiHandler } from 'next'

type GetResponse = {
  data: TProjectJourneyType | TProjectJourneyType[]
}

const getProjectJourneyTypesRoute: NextApiHandler<GetResponse> = async (req, res) => {
  await validateAuthentication(req, res)
  const { id } = req.query

  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const collection: Collection<TProjectJourneyType> = db.collection('project-journey-types')

  if (id) {
    if (typeof id != 'string' || !ObjectId.isValid(id)) throw new createHttpError.BadRequest('ID inválido.')
    const journeyType = await getProjectJourneyTypeById({ id, collection, query: {} })
    if (!journeyType) throw new createHttpError.NotFound('Tipo de jornada de projeto não encontrado.')

    return res.status(200).json({ data: journeyType })
  }

  const journeyTypes = await getProjectJourneyTypes({ collection, query: {} })

  return res.status(200).json({ data: journeyTypes })
}

type PostResponse = {
  data: { insertedId: string }
  message: string
}

const createProjectJourneyTypeRoute: NextApiHandler<PostResponse> = async (req, res) => {
  const session = await validateAuthorization(req, res, 'configuracoes', 'tiposProjeto', true)

  const journeyType = InsertProjectJourneyTypeSchema.parse(req.body)

  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const collection: Collection<TProjectJourneyType> = db.collection('project-journey-types')

  const insertResponse = await insertProjectJourneyType({ info: journeyType, collection })
  if (!insertResponse.acknowledged) throw new createHttpError.InternalServerError('Oops, houve um erro desconhecido ao tentar criar tipo de jornada.')
  const insertedId = insertResponse.insertedId.toString()

  return res.status(201).json({ data: { insertedId }, message: 'Tipo de jornada criado com sucesso !' })
}

type PutResponse = {
  data: string
  message: string
}

const updateProjectJourneyTypeRoute: NextApiHandler<PutResponse> = async (req, res) => {
  const session = await validateAuthorization(req, res, 'configuracoes', 'tiposProjeto', true)

  const { id } = req.query
  if (!id || typeof id != 'string' || !ObjectId.isValid(id)) throw new createHttpError.BadRequest('ID inválido.')

  const changes = InsertProjectJourneyTypeSchema.partial().parse(req.body)

  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const collection: Collection<TProjectJourneyType> = db.collection('project-journey-types')

  const updateResponse = await updateProjectJourneyType({ id, collection, changes })
  if (updateResponse.matchedCount == 0) throw new createHttpError.NotFound('Tipo de jornada não encontrada.')
  if (!updateResponse.acknowledged) throw new createHttpError.InternalServerError('Oops, houve um erro desconhecido ao atualizar tipo de jornada.')

  return res.status(201).json({ data: 'Tipo de jornada atualizado com sucesso !', message: 'Tipo de jornada atualizado com sucesso !' })
}
export default apiHandler({ GET: getProjectJourneyTypesRoute, POST: createProjectJourneyTypeRoute, PUT: updateProjectJourneyTypeRoute })
