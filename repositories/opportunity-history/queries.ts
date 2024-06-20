import { TActivity } from '@/utils/schemas/activities.schema'
import { TOpportunityHistory } from '@/utils/schemas/opportunity-history.schema'
import { Collection, Filter, ObjectId } from 'mongodb'

type GetOpportunityHistoryParams = {
  opportunityId: string
  collection: Collection<TOpportunityHistory>
  query: Filter<TOpportunityHistory>
}
export async function getOpportunityHistory({ opportunityId, collection, query }: GetOpportunityHistoryParams) {
  try {
    const opportunityHistory = await collection
      .find({ 'oportunidade.id': opportunityId, ...query })
      .sort({ dataInsercao: -1 })
      .toArray()
    return opportunityHistory
  } catch (error) {
    throw error
  }
}

type GetOpenActivitiesParams = {
  collection: Collection<TActivity>
  query: Filter<TActivity>
}
export async function getOpenActivities({ collection, query }: GetOpenActivitiesParams) {
  try {
    const activities = await collection
      .find({ dataVencimento: { $ne: null }, dataConclusao: null, ...query })
      .sort({ dataVencimento: -1 })
      .toArray()
    return activities
  } catch (error) {
    throw error
  }
}

type GetOpportunityHistoryById = {
  id: string
  collection: Collection<TOpportunityHistory>
  partnerId: string
}
export async function getOpportunityHistoryById({ id, collection, partnerId }: GetOpportunityHistoryById) {
  try {
    const opportunityHistory = await collection.findOne({ _id: new ObjectId(id), idParceiro: partnerId })
    return opportunityHistory
  } catch (error) {
    throw error
  }
}
