import { getProjectById, getProjects } from '@/repositories/projects/queries'
import connectToDatabase from '@/services/mongodb/crm-db-connection'
import { apiHandler, validateAuthenticationWithSession, validateAuthorization } from '@/utils/api'
import { GeneralProjectSchema, TProject } from '@/utils/schemas/project.schema'
import createHttpError from 'http-errors'
import { Collection, ObjectId } from 'mongodb'
import { NextApiHandler } from 'next'

type PostResponse = {
  data: { insertedId: string }
  message: string
}
const addNewProject: NextApiHandler<PostResponse> = async (req, res) => {
  const session = await validateAuthenticationWithSession(req, res)

  const project = GeneralProjectSchema.parse(req.body)

  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const collection: Collection<TProject> = db.collection('projects')

  const lastIndexer = await collection.findOne({}, { sort: { indexador: -1 } })

  const insertResponse = await collection.insertOne({ ...project, indexador: (lastIndexer?.indexador || 0) + 1 })
  if (!insertResponse.acknowledged) throw new createHttpError.InternalServerError('Oops, houve um erro desconhecido ao criar o projeto.')

  const insertedId = insertResponse.insertedId.toString()

  return res.status(201).json({ data: { insertedId }, message: 'Projeto criado com sucesso !' })
}

type GetResponse = {
  data: TProject | TProject[]
}

const getProjectsRoute: NextApiHandler<GetResponse> = async (req, res) => {
  const session = await validateAuthorization(req, res, 'projetos', 'visualizar', true)
  const { id } = req.query

  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const collection: Collection<TProject> = db.collection('projects')

  if (id) {
    if (typeof id != 'string' || !ObjectId.isValid(id)) throw new createHttpError.BadRequest('ID inválido.')
    const project = await getProjectById({ id, collection, query: {} })
    if (!project) throw new createHttpError.BadRequest('Projeto não encontrado.')
    return res.status(200).json({ data: project })
  }

  const projects = await getProjects({ collection, query: {} })

  return res.status(200).json({ data: projects })
}

type PutResponse = {}

export default apiHandler({ GET: getProjectsRoute, POST: addNewProject })
