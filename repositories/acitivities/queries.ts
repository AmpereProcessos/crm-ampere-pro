import { TActivity } from '@/utils/schemas/activities.schema'
import { Collection, Filter, ObjectId } from 'mongodb'

type GetActivityByIdParams = {
  collection: Collection<TActivity>
  id: string
  query: Filter<TActivity>
}

export async function getActivityById({ id, collection, query }: GetActivityByIdParams) {
  try {
    const activity = await collection.findOne({ _id: new ObjectId(id) })
    return activity
  } catch (error) {
    throw error
  }
}

type GetActivitiesByOpportunityIdParams = {
  opportunityId: string
  collection: Collection<TActivity>
  query: Filter<TActivity>
}
export async function getActivitiesByOpportunityId({ opportunityId, collection, query }: GetActivitiesByOpportunityIdParams) {
  try {
    const activities = await collection.find({ 'oportunidade.id': opportunityId, ...query }, { sort: { dataInsercao: -1 } }).toArray()
    return activities
  } catch (error) {
    throw error
  }
}
type GetActivitiesByHomologationIdParams = {
  homologationId: string
  collection: Collection<TActivity>
  query: Filter<TActivity>
}
export async function getActivitiesByHomologationId({ homologationId, collection, query }: GetActivitiesByHomologationIdParams) {
  try {
    const activities = await collection.find({ idHomologacao: homologationId, ...query }, { sort: { dataInsercao: -1 } }).toArray()
    return activities
  } catch (error) {
    throw error
  }
}
type GetActivitiesByTechnicalAnalysisIdParams = {
  technicalAnalysisId: string
  collection: Collection<TActivity>
  query: Filter<TActivity>
}
export async function getActivitiesByTechnicalAnalysisId({ technicalAnalysisId, collection, query }: GetActivitiesByTechnicalAnalysisIdParams) {
  try {
    const activities = await collection.find({ idAnaliseTecnica: technicalAnalysisId, ...query }, { sort: { dataInsercao: -1 } }).toArray()
    return activities
  } catch (error) {
    throw error
  }
}
type GetActivitiesByPurchaseIdParams = {
  purchaseId: string
  collection: Collection<TActivity>
  query: Filter<TActivity>
}
export async function getActivitiesByPurchaseId({ purchaseId, collection, query }: GetActivitiesByPurchaseIdParams) {
  try {
    const activities = await collection.find({ idCompra: purchaseId, ...query }, { sort: { dataInsercao: -1 } }).toArray()
    return activities
  } catch (error) {
    throw error
  }
}

type GetActivitiesByResponsibleIdParams = {
  responsibleId: string
  collection: Collection<TActivity>
  query: Filter<TActivity>
}

export async function getActivitiesByResponsibleId({ responsibleId, collection, query }: GetActivitiesByResponsibleIdParams) {
  try {
    const acitivities = await collection.find({ 'responsaveis.id': responsibleId, ...query }).toArray()
    return acitivities
  } catch (error) {
    throw error
  }
}
type GetAllActivitiesParams = {
  collection: Collection<TActivity>
  query: Filter<TActivity>
}

export async function getAllActivities({ collection, query }: GetAllActivitiesParams) {
  try {
    const acitivities = await collection.find({ ...query }).toArray()
    return acitivities
  } catch (error) {
    throw error
  }
}
