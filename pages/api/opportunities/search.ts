import { formatDateQuery } from '@/lib/methods/formatting'
import connectToDatabase from '@/services/mongodb/crm-db-connection'
import { apiHandler, validateAuthentication, validateAuthenticationWithSession } from '@/utils/api'
import {
  PersonalizedOpportunityQuerySchema,
  SimplifiedOpportunityWithProposalProjection,
  TOpportunity,
  TOpportunitySimplifiedDTO,
  TOpportunitySimplifiedDTOWithProposal,
} from '@/utils/schemas/opportunity.schema'
import createHttpError from 'http-errors'
import { Collection, Filter } from 'mongodb'
import { NextApiHandler } from 'next'
import { z } from 'zod'

const ParamSchema = z.string({
  required_error: 'Parâmetros de busca não informados.',
  invalid_type_error: 'Tipo não válido para os parâmetros de busca.',
})

type GetResponse = {
  data: TOpportunity[]
}

const getOpportunitiesBySearch: NextApiHandler<GetResponse> = async (req, res) => {
  await validateAuthentication(req, res)
  const search = ParamSchema.parse(req.query.param)

  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const collection: Collection<TOpportunity> = db.collection('opportunities')

  const opportunities = await collection
    .find(
      {
        $or: [{ nome: { $regex: search, $options: 'i' } }, { identificador: { $regex: search, $options: 'i' } }],
      },
      { projection: { nome: 1, identificador: 1, responsavel: 1 } }
    )
    .toArray()
  if (opportunities.length == 0) throw new createHttpError.NotFound('Nenhuma oportunidade encontrada com esse parâmetro.')
  return res.status(200).json({ data: opportunities })
}

export type TOpportunitiesByFilterResult = {
  opportunities: TOpportunitySimplifiedDTOWithProposal[]
  opportunitiesMatched: number
  totalPages: number
}

type PostResponse = {
  data: TOpportunitiesByFilterResult
}
const QuerySchema = z.object({
  page: z.string({ required_error: 'Parâmetro de páginação não informado.' }),
})
const getOpportunitiesByPersonalizedFilters: NextApiHandler<PostResponse> = async (req, res) => {
  const PAGE_SIZE = 500
  const session = await validateAuthenticationWithSession(req, res)
  const partnerScope = session.user.permissoes.parceiros.escopo
  const userScope = session.user.permissoes.oportunidades.escopo

  const { page } = QuerySchema.parse(req.query)
  const { responsibles, partners, projectTypes, filters } = PersonalizedOpportunityQuerySchema.parse(req.body)

  // If user has a scope defined and in the request there isnt a responsible arr defined, then user is trying
  // to access a overall visualiation, which he/she isnt allowed
  if (!!userScope && !responsibles) throw new createHttpError.Unauthorized('Seu usuário não possui autorização para esse escopo de visualização.')

  // If user has a scope defined and in the request there isnt a partners arr defined, then user is trying
  // to access a overall visualiation, which he/she isnt allowed
  if (!!partnerScope && !partners) throw new createHttpError.Unauthorized('Seu usuário não possui autorização para esse escopo de visualização.')

  // If user has a scope defined and in the applicant arr request there is a single applicant that is not in hes/shes scope
  // then user is trying to access a visualization he/she isnt allowed
  if (!!userScope && responsibles?.some((r) => !userScope.includes(r)))
    throw new createHttpError.Unauthorized('Seu usuário não possui autorização para esse escopo de visualização.')

  // If user has a partner scope defined and in the partner arr request there is a single partner that is not in hes/shes scope
  // then user is trying to access a visualization he/she isnt allowed
  if (!!partnerScope && partners?.some((r) => !partnerScope.includes(r)))
    throw new createHttpError.Unauthorized('Seu usuário não possui autorização para esse escopo de visualização.')

  // Validating page parameter
  if (!page || isNaN(Number(page))) throw new createHttpError.BadRequest('Parâmetro de paginação inválido ou não informado.')

  const nameQuery: Filter<TOpportunity> =
    filters.name.trim().length > 0 ? { $or: [{ nome: { $regex: filters.name, $options: 'i' } }, { nome: filters.name }] } : {}

  const projectTypesQuery: Filter<TOpportunity> = projectTypes ? { 'tipo.id': { $in: projectTypes } } : {}
  const cityQuery: Filter<TOpportunity> = filters.city.length > 0 ? { 'localizacao.cidade': { $in: filters.city } } : {}
  const dateQuery: Filter<TOpportunity> =
    filters.period.after && filters.period.before && filters.period.field
      ? {
          $and: [
            { [filters.period.field]: { $gte: formatDateQuery(filters.period.after, 'start') } },
            { [filters.period.field]: { $lte: formatDateQuery(filters.period.before, 'end') } },
          ],
        }
      : {}
  const responsiblesQuery: Filter<TOpportunity> = responsibles ? { 'responsaveis.id': { $in: responsibles } } : {}
  const partnersQuery: Filter<TOpportunity> = partners ? { idParceiro: { $in: partners } } : {}

  const query = { ...nameQuery, ...cityQuery, ...dateQuery, ...responsiblesQuery, ...projectTypesQuery, ...partnersQuery }

  const skip = PAGE_SIZE * (Number(page) - 1)
  const limit = PAGE_SIZE
  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const collection = db.collection<TOpportunity>('opportunities')

  const { opportunities, opportunitiesMatched } = await getOpportunitiesByFilters({ collection, query, skip, limit })
  const result = opportunities.map((opportunity) => ({
    ...opportunity,
    proposta: {
      nome: opportunity.proposta[0]?.nome,
      valor: opportunity.proposta[0]?.valor,
      potenciaPico: opportunity.proposta[0]?.potenciaPico,
    },
  })) as TOpportunitySimplifiedDTOWithProposal[]
  const totalPages = Math.round(opportunitiesMatched / PAGE_SIZE)

  return res.status(200).json({ data: { opportunities: result, opportunitiesMatched, totalPages } })
}

type GetOpportunitiesByFiltersParams = {
  collection: Collection<TOpportunity>
  query: Filter<TOpportunity>
  skip: number
  limit: number
}
async function getOpportunitiesByFilters({ collection, query, skip, limit }: GetOpportunitiesByFiltersParams) {
  const opportunitiesMatched = await collection.countDocuments({ ...query })
  const sort = { _id: -1 }
  const addFields = { idPropostaAtivaObjectId: { $toObjectId: '$idPropostaAtiva' } }
  const lookup = { from: 'proposals', localField: 'idPropostaAtivaObjectId', foreignField: '_id', as: 'proposta' }
  const projection = SimplifiedOpportunityWithProposalProjection
  const opportunities = await collection
    .aggregate([
      { $sort: sort },
      { $match: { ...query } },
      { $skip: skip },
      { $addFields: addFields },
      { $lookup: lookup },
      { $project: projection },
      { $limit: limit },
    ])
    .toArray()
  return { opportunities, opportunitiesMatched }
}

export default apiHandler({
  GET: getOpportunitiesBySearch,
  POST: getOpportunitiesByPersonalizedFilters,
})
