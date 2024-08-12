import { InsertHomologationSchema, THomologation } from '@/utils/schemas/homologation.schema'
import { Collection, Filter, ObjectId } from 'mongodb'

type GetHomologationByIdParams = {
  collection: Collection<THomologation>
  id: string
  query: Filter<THomologation>
}
export async function getHomologationById({ collection, id, query }: GetHomologationByIdParams) {
  try {
    const homologation = await collection.findOne({ _id: new ObjectId(id), ...query })
    return homologation
  } catch (error) {
    throw error
  }
}

type GetHomologationByOpportunityIdParams = {
  collection: Collection<THomologation>
  opportunityId: string
  query: Filter<THomologation>
}
export async function getHomologationByOpportunityId({ collection, opportunityId, query }: GetHomologationByOpportunityIdParams) {
  try {
    const homologations = await collection.find({ 'oportunidade.id': opportunityId, ...query }, { sort: { _id: -1 } }).toArray()
    return homologations
  } catch (error) {
    throw error
  }
}

type GetPartnerHomologationsParams = {
  collection: Collection<THomologation>
  query: Filter<THomologation>
}

export async function getPartnerHomologations({ collection, query }: GetPartnerHomologationsParams) {
  try {
    const homologations = await collection.find({ ...query }, { sort: { _id: -1 } }).toArray()
    return homologations
  } catch (error) {
    throw error
  }
}
