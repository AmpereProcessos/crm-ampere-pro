import axios from 'axios'
import toast from 'react-hot-toast'
import { TOpportunity } from '../schemas/opportunity.schema'
import { TClient } from '../schemas/client.schema'
import { TFunnelReference } from '../schemas/funnel-reference.schema'
import { updateAppProject } from './app-projects'

type HandleProjectCreationParams = {
  info: TOpportunity
}
export async function createOpportunity({ info }: HandleProjectCreationParams) {
  try {
    const { data } = await axios.post('/api/opportunities', info)
    if (data.data?.insertedId) return data.data.insertedId as string
    return 'Cliente criado com sucesso !'
  } catch (error) {
    throw error
  }
}

type CreateClientOpportunityAndFunnelReferenceParams = {
  clientId: string | null | undefined
  client: TClient
  opportunity: TOpportunity
  funnelReference: TFunnelReference
  returnId: boolean
}
export async function createClientOpportunityAndFunnelReference({
  clientId,
  client,
  opportunity,
  funnelReference,
  returnId = false,
}: CreateClientOpportunityAndFunnelReferenceParams) {
  try {
    const { data } = await axios.post('/api/opportunities/personalized', { clientId, client, opportunity, funnelReference })
    if (returnId) return data.data?.insertedOpportunityId as string
    if (typeof data.message != 'string') return 'Oportunidade criada com sucesso !'
    return data.data as string
  } catch (error) {
    throw error
  }
}
type UpdateOpportunityParams = {
  id: string
  changes: any
}
export async function updateOpportunity({ id, changes }: UpdateOpportunityParams) {
  try {
    const { data } = await axios.put(`/api/opportunities?id=${id}`, changes)
    if (typeof data.data != 'string') return 'Oportunidade alterada com sucesso !'
    return data.message
  } catch (error) {
    throw error
  }
}
export async function winOpportunity({ proposalId, opportunityId }: { proposalId: string; opportunityId: string }) {
  try {
    const { data } = await axios.put(`/api/opportunities?id=${opportunityId}`, {
      'ganho.data': new Date().toISOString(),
      'ganho.idProposta': proposalId,
      'perda.descricaoMotivo': null,
      'perda.data': null,
    })
    if (typeof data.data != 'string') return 'Oportunidade alterada com sucesso !'
    return data.message
  } catch (error) {
    throw error
  }
}
export async function setOpportunityActiveProposal({ proposalId, opportunityId }: { proposalId: string; opportunityId: string }) {
  try {
    const { data } = await axios.put(`/api/opportunities?id=${opportunityId}`, {
      idPropostaAtiva: proposalId,
    })
    if (typeof data.data != 'string') return 'Oportunidade alterada com sucesso !'
    return data.message
  } catch (error) {
    throw error
  }
}

export async function updateWinningProposal({ proposalId, opportunityId, appProjectId }: { proposalId: string; opportunityId: string; appProjectId?: string }) {
  try {
    const { data } = await axios.put(`/api/opportunities?id=${opportunityId}`, {
      'ganho.idProposta': proposalId,
    })
    if (appProjectId) await updateAppProject(appProjectId, { idPropostaCRM: proposalId })
    return data.message as string
  } catch (error) {
    throw error
  }
}
