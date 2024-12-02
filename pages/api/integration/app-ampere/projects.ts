import connectToAmpereProjectsDatabase from '@/services/mongodb/ampere/projects-db-connection'
import { apiHandler, validateAuthenticationWithSession } from '@/utils/api'
import { TAppProject } from '@/utils/schemas/integrations/app-ampere/projects.schema'
import createHttpError from 'http-errors'
import { Collection, ObjectId } from 'mongodb'
import { NextApiHandler } from 'next'

type PutResponse = {
  data: string
  message: string
}
const updateProject: NextApiHandler<PutResponse> = async (req, res) => {
  const session = await validateAuthenticationWithSession(req, res)

  const { id } = req.query
  if (!id || typeof id != 'string' || !ObjectId.isValid(id)) throw new createHttpError.BadRequest('ID inválido.')

  const changes = req.body
  const db = await connectToAmpereProjectsDatabase(process.env.OPERATIONAL_MONGODB_URI)
  const collection: Collection<TAppProject> = db.collection('dados')

  const updateResponse = await collection.updateOne({ _id: new ObjectId(id) }, { $set: { ...changes } })

  if (!updateResponse.acknowledged) throw new createHttpError.InternalServerError('Oops, ocorreu um erro ao atualizar o projeto.')

  return res.status(200).json({ data: 'Projeto atualizado com sucesso !', message: 'Projeto atualizado com sucesso !' })
}

export default apiHandler({ PUT: updateProject })
