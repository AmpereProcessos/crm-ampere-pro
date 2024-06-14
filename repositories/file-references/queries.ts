import { TFileReference } from '@/utils/schemas/file-reference.schema'
import { Collection, Filter } from 'mongodb'

type GetFileReferenceByQueryParams = {
  collection: Collection<TFileReference>
  query: Filter<TFileReference>
}

export async function getFileReferencesByQuery({ collection, query }: GetFileReferenceByQueryParams) {
  try {
    const references = await collection.find({ ...query }).toArray()
    return references
  } catch (error) {
    throw error
  }
}
type GetFileReferenceByOpportunityParams = {
  collection: Collection<TFileReference>
  opportunityId: string
  partnerId: string
}

export async function getFileReferencesByOpportunityId({ collection, opportunityId, partnerId }: GetFileReferenceByOpportunityParams) {
  try {
    const references = await collection.find({ idOportunidade: opportunityId }).toArray()
    return references
  } catch (error) {
    throw error
  }
}

type GetFileReferenceByAnalysisParams = {
  collection: Collection<TFileReference>
  analysisId: string
  partnerId: string
}

export async function getFileReferencesByAnalysisId({ collection, analysisId, partnerId }: GetFileReferenceByAnalysisParams) {
  try {
    const references = await collection.find({ idAnaliseTecnica: analysisId }).toArray()
    return references
  } catch (error) {
    throw error
  }
}
type GetFileReferenceByClientParams = {
  collection: Collection<TFileReference>
  clientId: string
  partnerId: string
}

export async function getFileReferencesByClientId({ collection, clientId, partnerId }: GetFileReferenceByClientParams) {
  try {
    const references = await collection.find({ idCliente: clientId }).toArray()
    return references
  } catch (error) {
    throw error
  }
}
type GetFileReferenceByHomologationParams = {
  collection: Collection<TFileReference>
  homologationId: string
  partnerId: string
}

export async function getFileReferencesByHomologationId({ collection, homologationId, partnerId }: GetFileReferenceByHomologationParams) {
  try {
    const references = await collection.find({ idHomologacao: homologationId }).toArray()
    return references
  } catch (error) {
    throw error
  }
}
