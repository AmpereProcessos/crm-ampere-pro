import {
  SimplifiedOpportunityWithProposalProjection,
  TOpportunity,
  TOpportunityDTO,
  TOpportunityDTOWithClient,
  TOpportunityDTOWithClientAndPartnerAndFunnelReferences,
  TOpportunitySimplified,
  TOpportunitySimplifiedDTO,
} from '@/utils/schemas/opportunity.schema'
import { TProposal } from '@/utils/schemas/proposal.schema'
import { Collection, Filter, MatchKeysAndValues, ObjectId, WithId } from 'mongodb'

type GetOpportunityById = {
  collection: Collection<TOpportunity>
  id: string
  query: Filter<TOpportunity>
}
export async function getOpportunityById({ collection, id, query }: GetOpportunityById) {
  try {
    // const opportunity = await collection.findOne({ _id: new ObjectId(id), idParceiro: partnerId || '' })

    const addFields = { clientAsObjectId: { $toObjectId: '$idCliente' }, partnerAsObjectId: { $toObjectId: '$idParceiro' }, idAsString: { $toString: '$_id' } }
    const clientLookup = { from: 'clients', localField: 'clientAsObjectId', foreignField: '_id', as: 'cliente' }
    const partnerLookup = { from: 'partners', localField: 'partnerAsObjectId', foreignField: '_id', as: 'parceiro' }
    const funnelReferencesLookup = { from: 'funnel-references', localField: 'idAsString', foreignField: 'idOportunidade', as: 'referenciasFunil' }
    const opportunityArr = await collection
      .aggregate([
        {
          $match: {
            _id: new ObjectId(id),
            ...query,
          },
        },
        {
          $addFields: addFields,
        },
        {
          $lookup: clientLookup,
        },
        {
          $lookup: partnerLookup,
        },
        {
          $lookup: funnelReferencesLookup,
        },
      ])
      .toArray()
    const opportunity = opportunityArr.map((op) => ({ ...op, cliente: op.cliente[0], parceiro: op.parceiro[0], referenciasFunil: op.referenciasFunil }))

    return opportunity[0] as TOpportunityDTOWithClientAndPartnerAndFunnelReferences
  } catch (error) {
    throw error
  }
}

type GetOpportunityByQueryParams = {
  collection: Collection<TOpportunity>
  query: Filter<TOpportunity>
}

type TOpportunityByQueryResult = TOpportunitySimplified & { proposta: WithId<TProposal>[] }
export async function getOpportunitiesByQuery({ collection, query }: GetOpportunityByQueryParams) {
  try {
    const addFields = { idPropostaAtivaObjectId: { $toObjectId: '$idPropostaAtiva' } }
    const lookup = { from: 'proposals', localField: 'idPropostaAtivaObjectId', foreignField: '_id', as: 'proposta' }
    const projection = SimplifiedOpportunityWithProposalProjection
    // const opportunities = await collection.find({ ...query, idParceiro: partnerId || '' }).toArray()
    const opportunities = (await collection
      .aggregate([{ $match: { ...query } }, { $addFields: addFields }, { $lookup: lookup }, { $project: projection }])
      .toArray()) as WithId<TOpportunityByQueryResult>[]

    return opportunities
  } catch (error) {
    throw error
  }
}

type GetOpportunitiesSimplifiedParams = {
  collection: Collection<TOpportunity>
  query: Filter<TOpportunity>
}
export async function getOpportunitiesSimplified({ collection, query }: GetOpportunitiesSimplifiedParams) {
  try {
    const projects = await collection.find({ ...query }, { projection: SimplifiedOpportunityWithProposalProjection, sort: { _id: -1 } }).toArray()

    return projects as TOpportunitySimplified[]
  } catch (error) {
    throw error
  }
}
