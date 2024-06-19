import axios from 'axios'
import createHttpError from 'http-errors'

type EditProjectRelatedEntitiesParams = {
  projectId: string
  clientId: string
  projectChanges: { [key: string]: any }
  clientChanges: { [key: string]: any }
}
export async function editProjectRelatedEntities({ projectId, clientId, projectChanges, clientChanges }: EditProjectRelatedEntitiesParams) {
  try {
    const { data } = await axios.put(`/api/projects/personalized?projectId=${projectId}&clientId=${clientId}`, { projectChanges, clientChanges })

    if (typeof data.message != 'string') return 'Atualizações feitas com sucesso !'
    return data.message as string
  } catch (error) {
    throw error
  }
}
