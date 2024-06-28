import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import { TProject, TProjectDTO, TProjectDTOWithReferences, TProjectUltraSimplifiedDTO } from '../schemas/project.schema'

async function fetchProjectById(id: string) {
  console.log('ID', id)
  if (!id) throw new Error('ID inválido.')
  try {
    const { data } = await axios.get(`/api/projects?id=${id}`)
    return data.data as TProjectDTOWithReferences
  } catch (error) {
    throw error
  }
}

export function useProjectById({ id }: { id: string }) {
  return useQuery({
    queryKey: ['project-by-id', id],
    queryFn: async () => await fetchProjectById(id),
    refetchOnWindowFocus: true,
  })
}

async function fetchComercialProjects() {
  try {
    const { data } = await axios.get('/api/projects/by-sector/comercial')
    return data.data as TProjectDTO[]
  } catch (error) {}
}

export function useComercialProjects() {
  return useQuery({
    queryKey: ['comercial-projects'],
    queryFn: fetchComercialProjects,
  })
}

async function fetchProjectsUltraSimplified() {
  try {
    const { data } = await axios.get('/api/projects/simplified')
    return data.data as TProjectUltraSimplifiedDTO[]
  } catch (error) {
    throw error
  }
}

export function useProjectsUltraSimplified() {
  return useQuery({
    queryKey: ['projects-ultra-simplified'],
    queryFn: fetchProjectsUltraSimplified,
  })
}
