import axios from 'axios'
import { TAppProject } from '../schemas/integrations/app-ampere/projects.schema'

export async function updateAppProject(projectId: string, changes: Partial<TAppProject>) {
  try {
    const { data } = await axios.put(`/api/integration/app-ampere/projects?id=${projectId}`, changes)
    return data.message as string
  } catch (error) {
    throw error
  }
}
