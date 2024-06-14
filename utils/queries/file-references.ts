import axios from 'axios'

import { useQuery } from '@tanstack/react-query'
import { TFileReferenceDTO, TFileReferencesQueryParams } from '../schemas/file-reference.schema'

type UseFileReferencesByOpportunityIdParams = {
  opportunityId: string
}
async function fetchFileReferencesByOpportunityId({ opportunityId }: UseFileReferencesByOpportunityIdParams) {
  try {
    const { data } = await axios.get(`/api/file-references?opportunityId=${opportunityId}`)
    return data.data as TFileReferenceDTO[]
  } catch (error) {
    throw error
  }
}

export function useFileReferencesByOpportunityId({ opportunityId }: UseFileReferencesByOpportunityIdParams) {
  return useQuery({
    queryKey: ['file-references-by-opportunity', opportunityId],
    queryFn: async () => await fetchFileReferencesByOpportunityId({ opportunityId }),
  })
}

async function fetchFileReferencesByAnalysisId({ analysisId }: { analysisId: string }) {
  try {
    const { data } = await axios.get(`/api/file-references?analysisId=${analysisId}`)
    return data.data as TFileReferenceDTO[]
  } catch (error) {
    throw error
  }
}

export function useFileReferencesByAnalysisId({ analysisId }: { analysisId: string }) {
  return useQuery({
    queryKey: ['file-references-by-analysis', analysisId],
    queryFn: async () => await fetchFileReferencesByAnalysisId({ analysisId }),
  })
}

async function fetchFileReferencesByClientId({ clientId }: { clientId: string }) {
  try {
    const { data } = await axios.get(`/api/file-references?clientId=${clientId}`)
    return data.data as TFileReferenceDTO[]
  } catch (error) {
    throw error
  }
}

export function useFileReferencesByClientId({ clientId }: { clientId: string }) {
  return useQuery({
    queryKey: ['file-references-by-client', clientId],
    queryFn: async () => await fetchFileReferencesByClientId({ clientId }),
  })
}

async function fetchFileReferencesByHomologationId({ homologationId }: { homologationId: string }) {
  try {
    const { data } = await axios.get(`/api/file-references?homologationId=${homologationId}`)
    return data.data as TFileReferenceDTO[]
  } catch (error) {
    throw error
  }
}

export function useFileReferencesByHomologationId({ homologationId }: { homologationId: string }) {
  return useQuery({
    queryKey: ['file-references-by-homologation', homologationId],
    queryFn: async () => await fetchFileReferencesByHomologationId({ homologationId }),
  })
}

async function fetchFileReferencesByQuery({ clientId, opportunityId, analysisId, homologationId, projectId }: TFileReferencesQueryParams) {
  try {
    const clientParam = clientId ? `clientId=${clientId}` : null
    const opportunityParam = opportunityId ? `opportunityId=${opportunityId}` : null
    const analysisParam = analysisId ? `analysisId=${analysisId}` : null
    const homologationParam = homologationId ? `homologationId=${homologationId}` : null
    const projectParam = projectId ? `projectId=${projectId}` : null
    const param = [clientParam, opportunityParam, analysisParam, homologationParam, projectParam].filter((q) => !!q).join('&')
    if (!param) return []

    const { data } = await axios.get(`/api/file-references/many?${param}`)
    return data.data as TFileReferenceDTO[]
  } catch (error) {
    throw error
  }
}

export function useFileReferences({ clientId, opportunityId, analysisId, homologationId, projectId }: TFileReferencesQueryParams) {
  return useQuery({
    queryKey: ['file-references-by-query', clientId, opportunityId, analysisId, homologationId, projectId],
    queryFn: async () => await fetchFileReferencesByQuery({ clientId, opportunityId, analysisId, homologationId, projectId }),
  })
}
