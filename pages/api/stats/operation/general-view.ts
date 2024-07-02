// FIELDS
// qtde
// nome
// identificador
// idCRM
// valor do contrato (sistema, padrão, estrutura)
// potencia pico
// data pedido
// data liberacao do parecer de acesso
// data solicitacao contrato
// data liberacao contrato
// data assinatura contrato
// data liberacao compra
// data de previsao de entrega
// data de entrega
// data entrada na obra
// data saida de obra
// data de assinatura das documentacoes
// data vistoria

import connectToAmpereProjectsDatabase from '@/services/mongodb/ampere/projects-db-connection'
import { validateAuthorization } from '@/utils/api'
import { TAppProject } from '@/utils/schemas/integrations/app-ampere/projects.schema'
import { Collection, Filter } from 'mongodb'
import { NextApiHandler } from 'next'

type PostResponse = any
const getGeneralOperationData: NextApiHandler<PostResponse> = async (req, res) => {
  const session = await validateAuthorization(req, res, 'resultados', 'visualizarOperacional', true)
  const partnerId = session.user.idParceiro

  const db = await connectToAmpereProjectsDatabase(process.env.MONGODB_URI)
  const projectsCollection: Collection<TAppProject> = db.collection('dados')
}

type GetSimplifiedProjectsProps = {
  collection: Collection<TAppProject>
  query: Filter<TAppProject>
}
async function getSimplifiedProjects({ collection, query }: GetSimplifiedProjectsProps) {
  try {
    const match = { 'contrato.status': { $ne: 'RESCISÃO DE CONTRATO' }, ...query }
  } catch (error) {}
}
