import { getDayStringsBetweenDates } from '@/lib/methods/dates'
import connectToAmpereProjectsDatabase from '@/services/mongodb/ampere/projects-db-connection'
import { apiHandler, validateAuthorization } from '@/utils/api'
import { TAppProject } from '@/utils/schemas/integrations/app-ampere/projects.schema'
import dayjs from 'dayjs'
import { Collection, Filter } from 'mongodb'
import { NextApiHandler } from 'next'
import { z } from 'zod'

function getContractValue({ system, pa, structure }: { system: number | string; pa: number | string; structure: number | string }) {
  const projeto = !isNaN(Number(system)) ? Number(system) : 0
  const padrao = !isNaN(Number(pa)) ? Number(pa) : 0
  const estrutura = !isNaN(Number(structure)) ? Number(structure) : 0

  return projeto + padrao + estrutura
}

export type TGeneralOperationStats = {
  vendas: TSalesValuesGraph
  nps: number
  tiposProjeto: { tipo: string; qtde: number }[]
}

type GetResponse = {
  data: TGeneralOperationStats
}

const QuerySchema = z.object({
  // projectType: z.string({ required_error: 'Tipo de projeto não fornecido ou inválido.', invalid_type_error: 'Tipo de projeto não fornecido ou inválido.' }),
  after: z
    .string({
      required_error: 'Parâmetros de período não fornecidos ou inválidos.',
      invalid_type_error: 'Parâmetros de período não fornecidos ou inválidos.',
    })
    .datetime({ message: 'Tipo inválido para parâmetro de período.' }),
  before: z
    .string({
      required_error: 'Parâmetros de período não fornecidos ou inválidos.',
      invalid_type_error: 'Parâmetros de período não fornecidos ou inválidos.',
    })
    .datetime({ message: 'Tipo inválido para parâmetro de período.' }),
})

const getOperationGeneralStatsRoute: NextApiHandler<GetResponse> = async (req, res) => {
  const session = await validateAuthorization(req, res, 'resultados', 'visualizarOperacional', true)
  const partnerScope = session.user.permissoes.parceiros.escopo

  const { after, before } = QuerySchema.parse(req.query)
  const db = await connectToAmpereProjectsDatabase(process.env.MONGODB_URI)
  const collection: Collection<TAppProject> = db.collection('dados')
  const afterDate = dayjs(after).toDate()
  const beforeDate = dayjs(before).toDate()

  const partnerQuery = partnerScope ? { idParceiro: { $in: [...partnerScope] } } : {}

  const sales = await getContractsWithinPeriod({ collection, query: partnerQuery, afterDate, beforeDate })
  const projectsByType = await getProjectsByType({ collection, query: partnerQuery })
  const nps = await getNPS({ collection, query: partnerQuery })

  return res.status(200).json({ data: { vendas: sales, nps, tiposProjeto: projectsByType } })
}
export default apiHandler({ GET: getOperationGeneralStatsRoute })

type TSalesValuesGraphReduced = { [key: string]: number }
type TSalesValuesGraph = { data: string; valor: number }[]

type GetContractsWithinPeriodParams = {
  collection: Collection<TAppProject>
  query: Filter<TAppProject>
  afterDate: Date
  beforeDate: Date
}
async function getContractsWithinPeriod({ afterDate, query, beforeDate, collection }: GetContractsWithinPeriodParams): Promise<TSalesValuesGraph> {
  try {
    const afterDateStr = afterDate.toISOString()
    const beforeDateStr = beforeDate.toISOString()
    const match: Filter<TAppProject> = {
      'contrato.status': { $ne: 'RESCISÃO DE CONTRATO' },
      ...query,
      'contrato.dataAssinatura': { $gte: afterDateStr, $lte: beforeDateStr },
    }
    const projection = { 'contrato.dataAssinatura': 1, 'sistema.valorProjeto': 1, 'padrao.valor': 1, 'estruturaPersonalizada.valor': 1 }
    const projects = await collection.find(match, { projection }).toArray()

    const datesStrs = getDayStringsBetweenDates({ initialDate: dayjs(afterDateStr).add(3, 'hours').toISOString(), endDate: beforeDateStr, format: 'MM/YYYY' })
    const initialSalesReduced = datesStrs.reduce((acc: TSalesValuesGraphReduced, current) => {
      acc[current] = 0
      return acc
    }, {})
    const sales = projects.reduce((acc: TSalesValuesGraphReduced, current) => {
      const data = dayjs(current.contrato.dataAssinatura).format('MM/YYYY')
      const valor = getContractValue({
        system: current.sistema.valorProjeto || 0,
        pa: current.padrao.valor || 0,
        structure: current.estruturaPersonalizada.valor || 0,
      })
      if (!acc[data]) acc[data] = 0
      acc[data] += valor
      return acc
    }, initialSalesReduced)

    return Object.entries(sales).map(([key, value]) => ({ data: key, valor: value }))
  } catch (error) {
    throw error
  }
}

type GetProjectsByTypeParams = {
  collection: Collection<TAppProject>
  query: Filter<TAppProject>
}

async function getProjectsByType({ collection, query }: GetProjectsByTypeParams) {
  try {
    const match = { 'contrato.status': { $ne: 'RESCISÃO DE CONTRATO' }, ...query }
    const group = { _id: '$tipoDeServico', contagem: { $count: {} } }
    const projects = await collection.aggregate([{ $match: match }, { $group: group }]).toArray()
    return projects.map((p) => ({ tipo: p._id as string, qtde: p.contagem as number }))
  } catch (error) {
    throw error
  }
}

type GetNPSParams = {
  collection: Collection<TAppProject>
  query: Filter<TAppProject>
}

async function getNPS({ collection, query }: GetNPSParams) {
  try {
    const match: Filter<TAppProject> = { ...query, nps: { $gte: 0, $lte: 10 }, 'contrato.status': { $ne: 'RESCISÃO DE CONTRATO' } }
    const projection = { nps: 1 }
    const consults = await collection.find(match, { projection }).toArray()
    const reduced = consults.reduce(
      (acc, current) => {
        const currentNPSValue = current.nps
        if (currentNPSValue != null && currentNPSValue >= 9) acc.promotores = acc.promotores + 1
        if (currentNPSValue != null && currentNPSValue <= 6) acc.detratores = acc.detratores + 1
        if (currentNPSValue != null && currentNPSValue <= 10) acc.consultas = acc.consultas + 1

        return acc
      },
      { consultas: 0, detratores: 0, promotores: 0 }
    )
    const { consultas, promotores, detratores } = reduced
    const nps = ((promotores - detratores) * 100) / consultas
    return nps
  } catch (error) {
    throw error
  }
}
