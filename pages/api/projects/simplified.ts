import { getProjectsUltraSimplified } from '@/repositories/projects/queries'
import connectToDatabase from '@/services/mongodb/crm-db-connection'
import { apiHandler, validateAuthenticationWithSession } from '@/utils/api'
import { TProject, TProjectUltraSimplified } from '@/utils/schemas/project.schema'
import { Collection, Filter } from 'mongodb'
import { NextApiHandler } from 'next'

type GetResponse = {
  data: TProjectUltraSimplified[]
}

const getUltraSimplifiedProjectsRoute: NextApiHandler<GetResponse> = async (req, res) => {
  const session = await validateAuthenticationWithSession(req, res)
  const partnersScope = session.user.permissoes.parceiros.escopo

  const partnersQuery: Filter<TProject> = partnersScope ? { idParceiro: { $in: partnersScope } } : {}
  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const collection: Collection<TProject> = db.collection('projects')

  const projects = await getProjectsUltraSimplified({ collection, query: partnersQuery })

  return res.status(200).json({ data: projects })
}

export default apiHandler({ GET: getUltraSimplifiedProjectsRoute })
