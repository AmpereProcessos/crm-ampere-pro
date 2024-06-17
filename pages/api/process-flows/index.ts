import { insertProcessFlow } from '@/repositories/process-flows/mutations'
import { getProcessFlowById, getProcessFlows } from '@/repositories/process-flows/queries'
import connectToDatabase from '@/services/mongodb/crm-db-connection'
import { apiHandler, validateAuthenticationWithSession, validateAuthorization } from '@/utils/api'
import { InsertProcessFlowSchema, TProcessFlow } from '@/utils/schemas/process-flow.schema'
import createHttpError from 'http-errors'
import { Collection, ObjectId } from 'mongodb'
import { NextApiHandler } from 'next'

type PostResponse = {
  data: { insertedId: string }
  message: string
}

const createProcessFlowRoute: NextApiHandler<PostResponse> = async (req, res) => {
  const session = await validateAuthorization(req, res, 'configuracoes', 'tiposProjeto', true)

  const flow = InsertProcessFlowSchema.parse(req.body)

  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const collection: Collection<TProcessFlow> = db.collection('process-flows')

  const insertResponse = await insertProcessFlow({ collection, info: flow })
  if (!insertResponse.acknowledged) throw new createHttpError.BadRequest('Oops, houve um erro desconhecido ao criar fluxo de processos.')
  const insertedId = insertResponse.insertedId.toString()

  return res.status(201).json({ data: { insertedId }, message: 'Fluxo de processos criado com sucesso !' })
}

type GetResponse = {
  data: TProcessFlow | TProcessFlow[]
}

const getProcessFlowsRoute: NextApiHandler<GetResponse> = async (req, res) => {
  const session = await validateAuthenticationWithSession(req, res)

  const { id } = req.query
  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const collection: Collection<TProcessFlow> = db.collection('process-flows')

  if (id) {
    if (typeof id != 'string' || !ObjectId.isValid(id)) throw new createHttpError.BadRequest('ID inválido.')
    const flow = await getProcessFlowById({ collection, id, query: {} })
    if (!flow) throw new createHttpError.NotFound('Fluxo de processos não encontrado.')
    return res.status(200).json({ data: flow })
  }

  const flows = await getProcessFlows({ collection, query: {} })

  return res.status(200).json({ data: flows })
}

export default apiHandler({ GET: getProcessFlowsRoute, POST: createProcessFlowRoute })
