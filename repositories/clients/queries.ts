import { getClientSearchParams } from '@/pages/api/clients/search'
import {
  ClientSimplifiedProjection,
  SimilarClientsSimplifiedProjection,
  TClient,
  TClientDTOSimplified,
  TClientSimplified,
  TSimilarClientSimplified,
  TSimilarClientSimplifiedDTO,
} from '@/utils/schemas/client.schema'
import { Collection, Filter, MatchKeysAndValues, ObjectId, WithId } from 'mongodb'

type GetClientByIdParams = {
  collection: Collection<TClient>
  id: string
  partnerId: string
}
export async function getClientById({ collection, id, partnerId }: GetClientByIdParams) {
  try {
    const clientsArr = await collection
      .aggregate([
        { $match: { _id: new ObjectId(id), idParceiro: partnerId } },
        {
          $addFields: {
            stringId: { $toString: '$_id' },
          },
        },
        {
          $lookup: {
            from: 'opportunities',
            localField: 'stringId',
            foreignField: 'idCliente',
            as: 'oportunidades',
          },
        },
      ])
      .toArray()
    const client = clientsArr[0]
    return client
  } catch (error) {
    throw error
  }
}
type GetExistentClientParams = {
  collection: Collection<TClient>
  email?: string
  cpfCnpj?: string
  phoneNumber: string
}
export async function getExistentClientByProperties({ collection, email, cpfCnpj, phoneNumber }: GetExistentClientParams) {
  try {
    const orParam = getClientSearchParams({ cpfCnpj, email, phoneNumber })
    const orQuery = orParam.length > 0 ? { $or: orParam } : {}
    const query = { ...orQuery }
    const client = await collection.findOne(query)

    return client
  } catch (error) {
    throw error
  }
}

type GetClientsParams = {
  collection: Collection<TClient>
  partnerId: string
  queryParam: MatchKeysAndValues<TClient>
}
export async function getClients({ collection, partnerId, queryParam }: GetClientsParams) {
  try {
    const clients = await collection.find({ idParceiro: partnerId, ...queryParam }).toArray()
    return clients
  } catch (error) {
    throw error
  }
}

type GetSimilarClientsParams = {
  collection: Collection<TClient>

  query: Filter<TClient>
}

export async function getSimilarClients({ collection, query }: GetSimilarClientsParams) {
  try {
    const clients = await collection.find({ ...query }, { projection: SimilarClientsSimplifiedProjection }).toArray()
    return clients as TSimilarClientSimplified[]
  } catch (error) {
    throw error
  }
}

type GetClientsByFiltersParams = {
  collection: Collection<TClient>
  query: Filter<TClient>
  skip: number
  limit: number
}
export async function getClientsByFilters({ collection, query, skip, limit }: GetClientsByFiltersParams) {
  try {
    // Getting the total clients matched by the query
    const clientsMatched = await collection.countDocuments({ ...query })
    const sort = { _id: -1 }
    const match = { ...query }
    const clients = await collection
      .aggregate([{ $sort: sort }, { $match: match }, { $skip: skip }, { $project: ClientSimplifiedProjection }, { $limit: limit }])
      .toArray()

    return { clients, clientsMatched } as { clients: TClientDTOSimplified[]; clientsMatched: number }
  } catch (error) {
    throw error
  }
}
